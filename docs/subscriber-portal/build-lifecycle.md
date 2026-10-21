---
sidebar_position: 6
title: Build Lifecycle
---

## What A Slot Build Is

A slot build is a run of ControlR's CI pipeline on GitHub's infrastructure. The portal records the build, asks GitHub to run the workflow against the ControlR repository, the pipeline compiles ControlR from your chosen release tag, applies your saved branding configuration and stored assets, and publishes the result in the format your slot is set to. A **Docker image** slot pushes the server image to your private registry. A **ZIP download** slot uploads a server archive that the portal hands you a download link for. This page covers every stage a sponsor can observe, from trigger to retention.

## What Must Be True Before A Build Starts

The portal runs these checks in this order when you select **Trigger build**. The trigger stops at the first one that fails and answers with a specific error.

1. You have **Execute** access on the slot. Triggering and cancelling builds use Execute, which is granted separately from Write.
2. The slot number is in range. Slots are numbered from 1 to 10. Out of range answers "Slot number must be between 1 and 10."
3. Your current entitlement covers the slot. Locked slots answer with "Slot N is locked for the current sponsorship entitlement."
4. The slot's saved configuration has a valid source ref. A slot that has never been saved fails with "A source ref must be selected."
5. The saved server runtime is one of the supported values. A **ZIP download** slot may target `win-x64`, while a **Docker image** slot is limited to the Linux runtimes. See [Delivery Format](/docs/subscriber-portal/slot-configuration#delivery-format).
6. On a **ZIP download** slot, the release tag has to convert into a valid version name. A tag that does not fails the trigger with "Release tag '...' cannot be delivered as a ZIP: its version name '...' must use only lowercase letters, digits, dots, dashes, and underscores." This fires before any build record is created, so it is a trigger error, not a failed build.
7. No other build is already active for the slot. See [One Build At A Time](#one-build-at-a-time).

There is no asset requirement. A build with zero uploaded assets runs and ships default ControlR artwork. There is no separate "ready" state on the slot page.

## The Status Sequence

A build passes through these states in this order. The portal shows the raw lowercase strings on the **Latest status** card.

1. `pending_validation`. The portal has created the build record and dispatched the request. It has not yet received a workflow run id from GitHub.
2. `queued`. GitHub has accepted the run. It is waiting for a runner.
3. `running`. A runner is building.
4. A final state, one of `succeeded`, `failed`, or `canceled`.

Two irregular paths exist. A `pending_validation` build that never gets a workflow run, because the dispatch errored or GitHub never returned a run, is marked `failed` after a few minutes with the summary "GitHub Actions did not return a workflow run for this build request." And a run that GitHub reports as skipped is mapped to `canceled`. An unrecognized completion result is mapped to `failed`.

### What Each Status Looks Like In The Panel

- While the build is in `pending_validation`, `queued`, or `running`, the trigger button is replaced by **Cancel build**.
- The **Duration** line under **Latest build details** is a value the portal computes on the server and shows as-is. It is not a stopwatch. Each refresh recomputes it from the recorded start time, so during a build it climbs in steps of about 10 seconds rather than smoothly. See [Keeping The Panel Current](#keeping-the-panel-current).
- On a **Docker image** slot, `succeeded` fills the **Image delivery** block with the produced image reference and the pull command. On a **ZIP download** slot it fills the **ZIP delivery** card with a **Download server** button. See [Getting Your Image](/docs/subscriber-portal/getting-your-image).
- `failed` shows a failure summary when the pipeline produced one. It typically names the job and the step that failed.
- `canceled` shows a summary saying GitHub Actions reported the build as canceled.

The portal never regresses a finished build back to an active state, so once you see a final state it stays.

## One Build At A Time

A slot runs at most one build at a time. While any build for the slot is in `pending_validation`, `queued`, or `running`, a new trigger is rejected with "Build slot N already has an active build in progress." The builds panel reflects this by hiding **Trigger build** while a build is active. Once the current build reaches a final state you can trigger the next one immediately. There is no cooldown between builds.

## Cancelling A Build

**Cancel build** opens a confirmation dialog titled "Cancel this build?" Its text states the behavior. The action asks GitHub Actions to stop the run, the build moves to `canceled`, which can take a few moments, and if the build finishes before GitHub processes the cancellation, its real result is kept. **Keep building** closes the dialog without doing anything.

What actually happens when you confirm:

- The portal calls GitHub's cancel endpoint for the workflow run. It does not mark anything canceled itself. The status changes when GitHub reports the run as canceled.
- If the run completes successfully a moment later, the build is `succeeded`, not `canceled`. The first final result to land wins.
- A real cancellation stops the CI job, which means a half-finished build publishes nothing. An image is only in your registry after a `succeeded`.
- A build that has not received a workflow run id yet cannot be cancelled. The portal tells you the build has not reached GitHub Actions yet and to refresh its status and try again.
- After you confirm, the panel keeps pulling the build status about every 10 seconds until it reaches a final state, so you do not need to poll manually.

## Keeping The Panel Current

**Refresh status** is a read-only pull. It fetches the current state of the slot's latest build from GitHub and updates what you see. It never starts, restarts, or cancels anything, and it needs only **Read** access on the slot.

The panel also keeps itself current while a build is in flight. It loads when you open the slot page, and while the latest build has not reached `succeeded`, `failed`, or `canceled`, it pulls that build again about every 10 seconds. Those pulls only happen while the tab is in the foreground, and they stop if the status has not changed for 30 minutes. When a build settles, the build history list reloads once.

GitHub's status also reaches the portal through webhooks and a background sweep that runs about every minute. Two cases still call for **Refresh status**: a build that has already finished, since the automatic poll stops at a final state, and a build whose poll stopped after 30 minutes without changing. If a page says `running` and you suspect it ended, select **Refresh status**.

## What A Build Reads From Your Slot

Two delivery mechanisms, two freshness rules:

- The configuration (brand name, publisher, colors, version) is snapshotted from the saved slot the moment the build is triggered and handed to the builder as a one-time link that expires within an hour and can only be fetched once. Editing the form after a trigger does not change a build in flight.
- Assets are fetched by the builder through signed links created at trigger time that expire after 15 minutes. The builder downloads them early in the run. Re-uploading an asset in the first minutes of a build can change what that build ships. Between builds, a replacement simply applies to the next build.

Because the configuration link is one-time, your configuration cannot be downloaded again later. Configuration JSON export is the way to keep a copy. History does not store a recoverable copy.

## Build History And Retention

The **Recent build history** list shows this slot's builds newest first, 20 per page. A row shows the requested time in its title, a status chip, the source ref, the duration, and the requested and completed timestamps, plus a failure summary if there was one. Rows are plain list items. They are not clickable, and they never show an image reference or a pull command. Image delivery for the latest build belongs to the delivery card above the list.

One exception is clickable. A row for a ZIP build that reached `succeeded` carries its own **Download server** button, so you can retrieve any successful build in the window, not just the latest. The button needs the slot's **Credentials** permission, so a member without it does not see it. Failed and cancelled rows carry no button, and a **Docker image** build's rows never do, including older Docker rows left in a ZIP slot's history after a format change.

Retention has teeth. A background job runs every 6 hours and deletes any build that finished (`succeeded`, `failed`, or `canceled`) more than 30 days ago. Builds that never reached a final state are kept until they do. So your build history is a rolling 30-day window, not an archive. If you need a permanent record of what shipped when, keep it yourself.

## If Something Goes Wrong

- A trigger error message is specific: locked slot, slot number out of range, missing source ref, a ZIP slot's release tag that cannot become a version name, or an active build already running. Read it before retrying. See [What Must Be True Before A Build Starts](#what-must-be-true-before-a-build-starts).
- A `failed` build's summary names the failing job and step. Fix the cause and trigger again, older failed attempts do not block retries.
- A build stuck at `pending_validation` with no status change after several refreshes means GitHub never accepted the run. It will be marked failed on its own.
- A `succeeded` build that you cannot pull is almost always a registry access problem, not a build problem. See [Getting Your Image](/docs/subscriber-portal/getting-your-image) and [Sponsorship Changes And Lapse](/docs/subscriber-portal/sponsorship-changes-and-lapse).
