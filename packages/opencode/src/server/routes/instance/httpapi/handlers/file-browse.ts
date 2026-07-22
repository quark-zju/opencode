import { FSUtil } from "@opencode-ai/core/fs-util"
import { Effect } from "effect"
import path from "path"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { WorkspaceRouteContext } from "../middleware/workspace-routing"

export const fileBrowseHandlers = HttpApiBuilder.group(InstanceHttpApi, "fileBrowse", (handlers) =>
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service

    const browse = Effect.fn("FileBrowseHttpApi.browse")(function* (ctx) {
      const directory = path.resolve((yield* WorkspaceRouteContext).directory)
      const target = path.resolve(directory, ctx.query.path)
      if (!FSUtil.contains(directory, target)) return yield* Effect.die(new Error("Path escapes the location"))
      return (yield* fs.readDirectoryEntries(target).pipe(Effect.orDie))
        .flatMap((item) => {
          if (item.type !== "file" && item.type !== "directory") return []
          const absolute = path.join(target, item.name)
          return [
            {
              name: item.name,
              path: path.relative(directory, absolute) + (item.type === "directory" ? path.sep : ""),
              absolute,
              type: item.type,
              ignored: item.type === "directory" && (item.name.startsWith(".") || item.name.startsWith("_")),
            },
          ]
        })
        .sort((a, b) => (a.type === b.type ? a.path.localeCompare(b.path) : a.type === "directory" ? -1 : 1))
    })

    return handlers.handle("browse", browse)
  }),
)
