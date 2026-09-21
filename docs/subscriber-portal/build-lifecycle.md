---
sidebar_position: 6
title: Build Lifecycle
---

## What A Slot Build Is

A slot build is a run of ControlR's CI pipeline on GitHub's infrastructure. The portal records the build, asks GitHub to run the workflow against the ControlR repository, the pipeline compiles ControlR from your chosen release tag, applies your saved branding configuration and stored assets, and pushes the resulting server image to your private registry. This page covers every stage a sponsor can observe, from trigger to retention.

## What Must Be True Before A Build Starts

The portal checks these in order when you select **Trigger build**, and the trigger fails with a specific error if any check fails:

1. You have **Execute** access on the slot. Triggering and cancelling builds use Execute, which is granted separately from Write.
2. Your current entitlement covers the slot. Locked slots answer with "Slot N is locked for the current sponsorship entitlement."
3. The slot's saved configuration has a valid source ref. A slot that has never been saved fails with "A source ref must be selected."
4. No other build is already active for the slot. See [One Build At A Time](#one-build-at-a-time).
5. The saved server runtime is one of the supported values.

There is no asset requirement. A build with zero uploaded assets runs and produces an image with default ControlR artwork. There is no separate "ready" state on the slot page.

## The Status Sequence

A build passes through these states in this order. The portal shows the raw lowercase strings on the **Latest status** card.

1. `pending_validation`. The portal has created the build record and dispatched the request. It has not yet received a workflow run id from GitHub.
2. `queued`. GitHub has accepted the run. It is waiting for a runner.
3. `running`. A runner is building.
4. A final state, one of `succeeded`, `failed`, or `canceled`.

Two irregular paths exist. A `pending_validation` build that never gets a workflow run, because the dispatch errored or GitHub never returned a run, is marked `failed` after a few minutes with the summary "GitHub Actions did not return a workflow run for this build request." And a run that GitHub reports as skipped is mapped to `canceled`. An unrecognized completion result is mapped to `failed`.

### What Each Status Looks Like In The Panel

- While the build is in `pending_validation`, `queued`, or `running`, the trigger button is replaced by **Cancel build**, and the duration shown under **Latest build details** keeps growing.
- `succeeded` fills the **Image delivery** block with the produced image reference and the pull command. See [Getting Your Image](/docs/subscriber-portal/getting-your-image).
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
- After you confirm, the panel quietly refreshes the build about every 10 seconds until it reaches a final state, so you do not need to poll manually.

## Refresh Status, And Why It Is Needed

**Refresh status** is a read-only pull. It fetches the current state of the slot's latest build from GitHub and updates what you see. It never starts, restarts, or cancels anything, and it needs only **Read** access on the slot.

The builds panel loads once when you open the slot page and then sits still, except while a cancellation is pending. GitHub's status changes reach the portal through webhooks and a background sweep that runs about every minute, so the page you left open can lag reality. If a dashboard says `running` and you suspect the build already finished, select **Refresh status**.

## What A Build Reads From Your Slot

Two delivery mechanisms, two freshness rules:

- The configuration (brand name, publisher, colors, version) is snapshotted from the saved slot the moment the build is triggered and handed to the builder as a one-time link that expires within an hour and can only be fetched once. Editing the form after a trigger does not change a build in flight.
- Assets are fetched by the builder through signed links created at trigger time that expire after 15 minutes. The builder downloads them early in the run. Re-uploading an asset in the first minutes of a build can change what that build ships. Between builds, a replacement simply applies to the next build.

Because the configuration link is one-time, your configuration cannot be downloaded again later. Configuration JSON export is the way to keep a copy. History does not store a recoverable copy.

## Build History And Retention

The **Recent build history** list shows this slot's builds newest first, 20 per page. A row shows the requested time in its title, a status chip, the source ref, the duration, and the requested and completed timestamps, plus a failure summary if there was one. Rows are plain list items. They are not clickable, and they never show an image reference or a pull command. Image delivery belongs to the latest build alone.

Retention has teeth. A background job runs every 6 hours and deletes any build that finished (`succeeded`, `failed`, or `canceled`) more than 30 days ago. Builds that never reached a final state are kept until they do. So your build history is a rolling 30-day window, not an archive. If you need a permanent record of what shipped when, keep it yourself.

## If Something Goes Wrong

- A trigger error message is specific: locked slot, missing source ref, or an active build already running. Read it before retrying.
- A `failed` build's summary names the failing job and step. Fix the cause and trigger again, older failed attempts do not block retries.
- A build stuck at `pending_validation` with no status change after several refreshes means GitHub never accepted the run. It will be marked failed on its own.
- A `succeeded` build that you cannot pull is almost always a registry access problem, not a build problem. See [Getting Your Image](/docs/subscriber-portal/getting-your-image) and [Sponsorship Changes And Lapse](/docs/subscriber-portal/sponsorship-changes-and-lapse).
