LINUX_ARM_TARGET := packages/opencode/dist/opencode-linux-arm64/bin/opencode

.PHONY: clean build-linux-arm deploy-linux-arm build deploy push

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
