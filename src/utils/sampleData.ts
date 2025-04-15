
import { Recording } from "@/types";

// Create array of sample recordings
export const sampleRecordings: Recording[] = [
  {
    id: "1",
    title: "Grandma's Birthday Story",
    createdAt: new Date(2023, 6, 15),
    duration: 125, // 2:05
    audioUrl: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-1.mp3",
    tags: ["Family", "Memory", "Birthday"]
  },
  {
    id: "2",
    title: "Dad's Fishing Trip Tale",
    createdAt: new Date(2023, 8, 3),
    duration: 83, // 1:23
    audioUrl: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-2.mp3",
    tags: ["Dad", "Story", "Childhood"]
  },
  {
    id: "3",
    title: "Mom's Recipe Instructions",
    createdAt: new Date(2023, 9, 10),
    duration: 195, // 3:15
    audioUrl: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-3.mp3",
    tags: ["Mom", "Recipe", "Important"]
  },
  {
    id: "4",
    title: "Baby's First Words",
    createdAt: new Date(2023, 11, 25),
    duration: 42, // 0:42
    audioUrl: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-4.mp3",
    tags: ["Baby", "Milestone", "Family"]
  },
  {
    id: "5",
    title: "Grandpa's War Story",
    createdAt: new Date(2024, 1, 7),
    duration: 312, // 5:12
    audioUrl: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-5.mp3",
    tags: ["Grandpa", "History", "Important"]
  }
];
