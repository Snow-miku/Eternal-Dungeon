import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: ["index.js", "index.css", "media", "fonts"],
          dest: ""
        }
      ]
    })
  ]
}