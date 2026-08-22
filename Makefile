LINUX_ARM_TARGET := packages/opencode/dist/opencode-linux-arm64/bin/opencode
FORCE_PUSH_TAG ?= 0

.PHONY: clean build-linux-arm deploy-linux-arm build deploy push pull prof

$(LINUX_ARM_TARGET):
	cd packages/opencode && OPENCODE_CHANNEL=prod bun run script/build.ts --os=linux --arch=arm64 --abi=glibc

build-linux-arm: $(LINUX_ARM_TARGET)

clean:
	rm -f $(LINUX_ARM_TARGET)

deploy-linux-arm: $(LINUX_ARM_TARGET)
	HOST=$$(grep -A1 '# opencode' ~/.ssh/config | tail -1 | sed 's/Host *//') && rsync --archive --compress $^ $$HOST:/usr/local/bin/opencode && ssh $$HOST 'systemctl restart opencode'

deploy: deploy-linux-arm

build: build-linux-arm

push:
	git fetch myfork dev:refs/remotes/myfork/dev perf:refs/remotes/myfork/perf
	@set -eu; \
	old_perf=$$(git rev-parse refs/remotes/myfork/perf); \
	upstream=$$(git merge-base "$$old_perf" refs/remotes/origin/dev); \
	tag=patched-$$(git show -s --format=%cs "$$upstream"); \
	tag_ref=refs/tags/$$tag; \
	existing=$$(git rev-parse --verify "$$tag_ref^{commit}" 2>/dev/null || true); \
	if [ "$(FORCE_PUSH_TAG)" = "1" ]; then \
		git tag -f "$$tag" "$$old_perf"; \
		tag_refspec=+$$tag_ref:$$tag_ref; \
	elif [ -n "$$existing" ] && [ "$$existing" != "$$old_perf" ]; then \
		echo "$$tag already points to $$existing, expected $$old_perf" >&2; \
		echo "set FORCE_PUSH_TAG=1 to move and force-push the tag" >&2; \
		exit 1; \
	else \
		if [ -z "$$existing" ]; then git tag "$$tag" "$$old_perf"; fi; \
		tag_refspec=$$tag_ref:$$tag_ref; \
	fi; \
	git push --no-verify --force-with-lease=refs/heads/perf myfork \
		"$$tag_refspec" \
		refs/remotes/origin/dev:refs/heads/dev \
		HEAD:refs/heads/perf

pull:
	git fetch myfork; git checkout myfork/perf

prof:
	mkdir -p /tmp/bun-cpu-prof
	cd packages/opencode && \
		OPENCODE_DISABLE_CHANNEL_DB=1 \
		OPENCODE_DISABLE_CLAUDE_CODE=1 \
		OPENCODE_DISABLE_EXTERNAL_SKILLS=1 \
		OPENCODE_DISABLE_LSP_DOWNLOAD=1 \
		OPENCODE_DISABLE_PROJECT_CONFIG=1 \
		OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER=1 \
		BUN_OPTIONS="--cpu-prof-md --cpu-prof --cpu-prof-dir /tmp/bun-cpu-prof" \
		bun src/index.ts serve --hostname 0.0.0.0 --port 40961 --print-logs --log-level DEBUG
