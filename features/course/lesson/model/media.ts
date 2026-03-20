import type { LessonVideoContent } from "./contracts";

export type VideoAssetMap = Partial<Record<string, LessonVideoContent>>;

const VIDEO_ASSET_JSON = `{
  "0.1": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "0df1d1d2-098a-425b-b6eb-3c465f0a32e1",
    "title": "Welcome Video",
    "durationLabel": "6m 37s"
  },
  "0.2": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "00823c2a-bcbf-4871-9a80-f47cdf6ef081",
    "title": "How the Sprint Works",
    "durationLabel": "51s"
  },
  "1.1": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "00823c2a-bcbf-4871-9a80-f47cdf6ef081",
    "title": "Start With the Problem",
    "durationLabel": "51s"
  },
  "1.2": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "b0173058-5cf9-4a93-b865-8bb6e48fd5f7",
    "title": "Pick One User",
    "durationLabel": "9m 41s"
  },
  "1.3": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "59276fe3-0832-455b-8223-2a2974028be8",
    "title": "Define the Outcome",
    "durationLabel": "59s"
  },
  "1.4": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "aac17809-c856-4274-badc-12a8b46a407d",
    "title": "Light Research, Not a Thesis",
    "durationLabel": "1m 17s"
  },
  "1.5": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "ce14c05d-c5f2-4b50-b1e8-4911015bdc20",
    "title": "Scope Hammer",
    "durationLabel": "1m 42s"
  },
  "1.6": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "2e170e89-c540-4e4f-8c41-af535ee293de",
    "title": "CEO Wrap-Up",
    "durationLabel": "11m 14s"
  },
  "1.7": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "0ca98e98-f8c2-40d8-88f1-15a97d1b4c8d",
    "title": "CEO Skills",
    "durationLabel": "8m 01s"
  },
  "2.0": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "93b203ac-7e91-455e-b484-2353c1cdd9f8",
    "title": "Design References",
    "durationLabel": "43s"
  },
  "2.1": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "edd73a35-0d4b-4147-8bcd-7ec005d55844",
    "title": "Map the Core Flow",
    "durationLabel": "8m 22s"
  },
  "2.2": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "f95a4d8c-a8b5-4233-9ae5-ccab39213304",
    "title": "Find References First",
    "durationLabel": "12m 42s"
  },
  "3.0": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "4c537ff8-e439-4cdb-a245-1856cb2cfa2c",
    "title": "Build Kickoff",
    "durationLabel": "1m 29s"
  },
  "3.1": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "256a5c69-87a9-4f72-9113-761752b21d63",
    "title": "Iterate the product with AI",
    "durationLabel": "3m 43s"
  },
  "3.2": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "374f9017-6573-426e-b2d4-270cbf1f747e",
    "title": "Map the Repo and Starter",
    "durationLabel": "3m 29s"
  },
  "3.3": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "1f3e0e52-639c-41c3-af41-e2c5fea44e94",
    "title": "Provider Setup",
    "durationLabel": "9m 35s"
  },
  "3.4": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "a623a365-8c6b-46d6-9cee-fcc14c6d9dbe",
    "title": "Wire DB, Auth, and Payments",
    "durationLabel": "5m 03s"
  },
  "3.5": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "d9159e14-caa0-4a57-a80f-acb9b7f2c595",
    "title": "Codex Marketing Site",
    "durationLabel": "4m 52s"
  },
  "3.6": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "482f6751-d8ae-49bc-890e-ecd53e4af200",
    "title": "Switch to Sandbox and Boot Local",
    "durationLabel": "9m 02s"
  },
  "3.7": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "c6f6c923-8324-4863-b46d-c8cd281ec53b",
    "title": "Read and Execute AI Plans",
    "durationLabel": "3m 24s"
  },
  "3.8": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "98c6b9e6-f6f8-4c83-8bd0-7a1dad073fd3",
    "title": "Build Setting Up Slices",
    "durationLabel": "5m 02s"
  },
  "3.9": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "2ee2f736-7dd7-4290-bb17-b6bb094556bd",
    "title": "Implement the First Slice",
    "durationLabel": "9m 16s"
  },
  "3.10": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "b22d8ee6-9b0f-40a9-ae16-9e858df4cca8",
    "title": "Build Core UX Plan Flow",
    "durationLabel": "4m 00s"
  },
  "3.11": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "9238835a-1761-459b-a823-9ef8edcb54f9",
    "title": "Core UX Build",
    "durationLabel": "3m 58s"
  },
  "3.12": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "d66742a0-f1df-4d84-acb0-c9932c53ff8c",
    "title": "Core UX Build 3",
    "durationLabel": "10m 02s"
  },
  "3.13": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "b596036b-f84c-40b4-9750-de202bbfdc7e",
    "title": "Debug and Stabilize Without Spiraling",
    "durationLabel": "2m 56s"
  },
  "3.14": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "80cf4290-f31d-4c14-b440-43ca312539c4",
    "title": "Wrapping",
    "durationLabel": "4m 40s"
  },
  "3.15": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "0ea4cf08-bd60-4758-ade9-9a41e3dd86da",
    "title": "Create Production Instance",
    "durationLabel": "20s"
  },
  "3.16": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "375cc9b2-6022-4ad8-bf00-ba0099adace0",
    "title": "Finalize Build Handoff and Unlock Ship",
    "durationLabel": "4m 23s"
  },
  "4.0": {
    "status": "ready",
    "provider": "bunny",
    "libraryId": 619172,
    "videoId": "8026e921-b067-41b3-93aa-c3f7ea92dd88",
    "title": "Product Review",
    "durationLabel": "4m 29s"
  }
}`;

export const videoAssets = JSON.parse(VIDEO_ASSET_JSON) as VideoAssetMap;
export const lessonMedia = videoAssets;
