/// <reference types="next" />
/// <reference types="next/image-types/global" />

// CSS module declarations
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}
