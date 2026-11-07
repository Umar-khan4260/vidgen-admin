/**
 * Canonical catalogue of every AI model the client app can request.
 *
 * Source of truth for the admin model toggles. IDs must match exactly what
 * the Flutter client sends to the backend (`VideoGenAIMacApp/lib/core/constants.dart`
 * and `lib/features/chat/chat_models.dart`).
 *
 * - Music (Suno) models are intentionally excluded.
 * - Text-to-3D entries are excluded because they are duplicates of text-to-video.
 * - A model id may be valid in more than one mode (see `alsoUsedIn`). Disabling
 *   it disables every mode that uses that id, because the backend enforces by id.
 */

export type ModelCategory =
  | 'text-to-image'
  | 'image-to-image'
  | 'text-to-video'
  | 'image-to-video'
  | 'video-to-video'
  | 'chat';

export interface CatalogModel {
  id: string;
  name: string;
  category: ModelCategory;
  /** Other modes that also use this model id. */
  alsoUsedIn?: ModelCategory[];
}

export const MODEL_CATEGORIES: {
  key: ModelCategory;
  label: string;
  description: string;
}[] = [
  { key: 'text-to-image', label: "Text to Image", description: "Generate images from a text prompt" },
  { key: 'image-to-image', label: "Image to Image", description: "Edit, upscale or restyle an existing image" },
  { key: 'text-to-video', label: "Text to Video", description: "Generate video from a text prompt" },
  { key: 'image-to-video', label: "Image to Video", description: "Animate a still image into video" },
  { key: 'video-to-video', label: "Video to Video", description: "Transform or reference an existing video" },
  { key: 'chat', label: "Chat", description: "Conversational and reasoning models" },
];

export const MODEL_CATALOG: CatalogModel[] = [
  { id: "flux-kontext-max", name: "Flux Kontext Max", category: 'text-to-image' },
  { id: "flux-kontext-pro", name: "Flux Kontext Pro", category: 'text-to-image' },
  { id: "flux-2/flex-text-to-image", name: "Flux-2", category: 'text-to-image' },
  { id: "flux-2/pro-text-to-image", name: "Flux-2 - Pro", category: 'text-to-image' },
  { id: "google/imagen4", name: "Google - imagen4", category: 'text-to-image' },
  { id: "google/imagen4-fast", name: "Google - imagen4-fast", category: 'text-to-image' },
  { id: "google/imagen4-ultra", name: "Google - imagen4-ultra", category: 'text-to-image' },
  { id: "google/nano-banana", name: "Google - Nano Banana", category: 'text-to-image' },
  { id: "google/nanobanana2", name: "Google - Nano Banana 2", category: 'text-to-image' },
  { id: "google/nano-banana-2-lite", name: "Google - Nano Banana 2 Lite", category: 'text-to-image' },
  { id: "nano-banana-pro", name: "Google - Nano Banana Pro", category: 'text-to-image' },
  { id: "gpt-image/1.5-text-to-image", name: "GPT Image 1.5", category: 'text-to-image' },
  { id: "gpt/gpt-image-2-text-to-image", name: "GPT Image 2", category: 'text-to-image' },
  { id: "gpt-4o-image", name: "GPT-4o Image", category: 'text-to-image' },
  { id: "grok-imagine/text-to-image", name: "Grok Imagine", category: 'text-to-image' },
  { id: "ideogram/v3-text-to-image", name: "Ideogram", category: 'text-to-image' },
  { id: "qwen/text-to-image", name: "Qwen", category: 'text-to-image' },
  { id: "qwen2/text-to-image", name: "Qwen2", category: 'text-to-image' },
  { id: "bytedance/seedream", name: "Seedream 3.0", category: 'text-to-image' },
  { id: "bytedance/seedream-v4-text-to-image", name: "Seedream 4.0", category: 'text-to-image' },
  { id: "seedream/4.5-text-to-image", name: "Seedream 4.5", category: 'text-to-image' },
  { id: "seedream/5-lite-text-to-image", name: "Seedream 5.0 Lite", category: 'text-to-image' },
  { id: "seedream/5-pro-text-to-image", name: "Seedream 5.0 Pro", category: 'text-to-image' },
  { id: "wan/2-7-image", name: "Wan", category: 'text-to-image' },
  { id: "wan/2-7-image-pro", name: "Wan 2.7 Pro", category: 'text-to-image', alsoUsedIn: ['image-to-image'] },
  { id: "z-image", name: "Z-Image", category: 'text-to-image' },
  { id: "flux-2/flex-image-to-image", name: "Flux-2 Flex I2I", category: 'image-to-image' },
  { id: "flux-2/pro-image-to-image", name: "Flux-2 Pro I2I", category: 'image-to-image' },
  { id: "google/nano-banana-edit", name: "Google - Nano Banana Edit", category: 'image-to-image', alsoUsedIn: ['text-to-image'] },
  { id: "gpt-image/1.5-image-to-image", name: "GPT Image 1.5 I2I", category: 'image-to-image' },
  { id: "gpt/gpt-image-2-image-to-image", name: "GPT Image 2 I2I", category: 'image-to-image' },
  { id: "grok-imagine/image-to-image", name: "Grok Imagine I2I", category: 'image-to-image' },
  { id: "qwen/image-to-image", name: "Qwen I2I", category: 'image-to-image' },
  { id: "qwen/image-edit", name: "Qwen Image Edit", category: 'image-to-image' },
  { id: "qwen2/image-edit", name: "Qwen2 Image Edit", category: 'image-to-image' },
  { id: "recraft/crisp-upscale", name: "Recraft Crisp Upscale", category: 'image-to-image' },
  { id: "recraft/remove-background", name: "Recraft Remove Background", category: 'image-to-image' },
  { id: "bytedance/seedream-v4-edit", name: "Seedream 4.0 Edit", category: 'image-to-image' },
  { id: "seedream/4.5-edit", name: "Seedream 4.5 Edit", category: 'image-to-image' },
  { id: "seedream/5-lite-image-to-image", name: "Seedream 5.0 Lite I2I", category: 'image-to-image' },
  { id: "seedream/5-pro-image-to-image", name: "Seedream 5.0 Pro I2I", category: 'image-to-image' },
  { id: "topaz/image-upscale", name: "Topaz Image Upscale", category: 'image-to-image' },
  { id: "bytedance/v1-lite-text-to-video", name: "Bytedance V1 Lite", category: 'text-to-video' },
  { id: "bytedance/v1-pro-text-to-video", name: "Bytedance V1 Pro", category: 'text-to-video' },
  { id: "grok-imagine/text-to-video", name: "Grok Imagine", category: 'text-to-video' },
  { id: "grok-imagine-video-1.5-preview", name: "Grok Imagine 1.5 Preview", category: 'text-to-video' },
  { id: "hailuo/02-text-to-video-pro", name: "Hailuo 02 Pro", category: 'text-to-video' },
  { id: "hailuo/02-text-to-video-standard", name: "Hailuo 02 Standard", category: 'text-to-video' },
  { id: "hailuo/2-3-text-to-video-pro", name: "Hailuo 2.3 Pro", category: 'text-to-video' },
  { id: "hailuo/2-3-text-to-video-standard", name: "Hailuo 2.3 Standard", category: 'text-to-video' },
  { id: "happy-horse/text-to-video", name: "HappyHorse", category: 'text-to-video' },
  { id: "kling-2.6/text-to-video", name: "Kling 2.6", category: 'text-to-video' },
  { id: "kling/v2-1-master-text-to-video", name: "Kling V2.1 Master", category: 'text-to-video' },
  { id: "kling/v2-1-pro-text-to-video", name: "Kling V2.1 Pro", category: 'text-to-video' },
  { id: "kling/v2-1-standard-text-to-video", name: "Kling V2.1 Standard", category: 'text-to-video' },
  { id: "kling/v2-5-turbo-text-to-video-pro", name: "Kling V2.5 Turbo Pro", category: 'text-to-video' },
  { id: "omnihuman/1-5-text-to-video", name: "OmniHuman 1.5", category: 'text-to-video' },
  { id: "pika-1.5-text-to-video", name: "Pika 1.5", category: 'text-to-video' },
  { id: "pixverse/v4-5-text-to-video", name: "PixVerse V4.5", category: 'text-to-video' },
  { id: "pixverse/v5-text-to-video", name: "PixVerse V5", category: 'text-to-video' },
  { id: "runway/gen3-alpha-turbo", name: "Runway Gen-3 Alpha Turbo", category: 'text-to-video' },
  { id: "bytedance/seedance-1.5-lite-text-to-video", name: "Seedance 1.5 Lite", category: 'text-to-video' },
  { id: "bytedance/seedance-1.5-pro-text-to-video", name: "Seedance 1.5 Pro", category: 'text-to-video' },
  { id: "sora-2-text-to-video", name: "Sora 2", category: 'text-to-video' },
  { id: "sora-2-pro-text-to-video", name: "Sora 2 Pro", category: 'text-to-video' },
  { id: "veo3", name: "Veo 3.1", category: 'text-to-video', alsoUsedIn: ['image-to-video'] },
  { id: "veo3_fast", name: "Veo 3.1 Fast", category: 'text-to-video', alsoUsedIn: ['image-to-video'] },
  { id: "veo3_lite", name: "Veo 3.1 Lite", category: 'text-to-video', alsoUsedIn: ['image-to-video'] },
  { id: "volcengine/text-to-video", name: "Volcengine", category: 'text-to-video' },
  { id: "wan/2-2-a14b-text-to-video-turbo", name: "Wan 2.2 A14B Turbo", category: 'text-to-video' },
  { id: "wan/2-5b-text-to-video", name: "Wan 2.5B", category: 'text-to-video' },
  { id: "wan/2-6-text-to-video", name: "Wan 2.6", category: 'text-to-video' },
  { id: "bytedance/v1-lite-image-to-video", name: "Bytedance V1 Lite", category: 'image-to-video' },
  { id: "bytedance/v1-pro-image-to-video", name: "Bytedance V1 Pro", category: 'image-to-video' },
  { id: "bytedance/v1-pro-fast-image-to-video", name: "Bytedance V1 Pro Fast", category: 'image-to-video' },
  { id: "grok-imagine/image-to-video", name: "Grok Imagine", category: 'image-to-video' },
  { id: "hailuo/02-image-to-video-pro", name: "Hailuo 02 Pro (2-Frames)", category: 'image-to-video' },
  { id: "hailuo/02-image-to-video-standard", name: "Hailuo 02 Standard (2-Frames)", category: 'image-to-video' },
  { id: "hailuo/2-3-image-to-video-pro", name: "Hailuo 2.3 Pro", category: 'image-to-video' },
  { id: "hailuo/2-3-image-to-video-standard", name: "Hailuo 2.3 Standard", category: 'image-to-video' },
  { id: "happy-horse/image-to-video", name: "HappyHorse", category: 'image-to-video' },
  { id: "kling-2.6/image-to-video", name: "Kling 2.6", category: 'image-to-video' },
  { id: "kling-2.6/motion-control", name: "Kling 2.6 Motion Control", category: 'image-to-video' },
  { id: "kling/v2-1-master-image-to-video", name: "Kling V2.1 Master", category: 'image-to-video' },
  { id: "kling/v2-1-pro", name: "Kling V2.1 Pro", category: 'image-to-video' },
  { id: "kling/v2-1-standard", name: "Kling V2.1 Standard", category: 'image-to-video' },
  { id: "kling/v2-5-turbo-image-to-video-pro", name: "Kling V2.5 Turbo Pro", category: 'image-to-video' },
  { id: "omnihuman/1-5-image-to-video", name: "OmniHuman 1.5", category: 'image-to-video' },
  { id: "pika-1.5-image-to-video", name: "Pika 1.5", category: 'image-to-video' },
  { id: "pixverse/v4-5-image-to-video", name: "PixVerse V4.5", category: 'image-to-video' },
  { id: "pixverse/v5-image-to-video", name: "PixVerse V5", category: 'image-to-video' },
  { id: "runway-gen3-image-to-video", name: "Runway Gen-3", category: 'image-to-video' },
  { id: "bytedance/seedance-1.5-pro", name: "Seedance 1.5 Pro", category: 'image-to-video' },
  { id: "sora-2-image-to-video", name: "Sora 2", category: 'image-to-video' },
  { id: "sora-2-pro-image-to-video", name: "Sora 2 Pro", category: 'image-to-video' },
  { id: "volcengine/image-to-video", name: "Volcengine", category: 'image-to-video' },
  { id: "wan/2-2-a14b-image-to-video-turbo", name: "Wan 2.2 A14B Turbo", category: 'image-to-video' },
  { id: "wan/2-6-image-to-video", name: "Wan 2.6", category: 'image-to-video' },
  { id: "gemini-omni-video", name: "Gemini 3 Omni", category: 'video-to-video' },
  { id: "minimax-h3/reference-to-video", name: "MiniMax H3", category: 'video-to-video' },
  { id: "aleph", name: "Runway Aleph", category: 'video-to-video' },
  { id: "bytedance/seedance-2", name: "Seedance 2", category: 'video-to-video' },
  { id: "wan/2-6-video-to-video", name: "Wan 2.6", category: 'video-to-video' },
  { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro", category: 'chat' },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", category: 'chat' },
  { id: "gpt-5-2", name: "GPT-5.2", category: 'chat' },
  { id: "grok-4-5", name: "Grok 4.5", category: 'chat' },
];
