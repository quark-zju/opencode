LINUX_ARM_TARGET := packages/opencode/dist/opencode-linux-arm64/bin/opencode

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
	git push --no-verify --set-upstream myfork HEAD:perf

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
