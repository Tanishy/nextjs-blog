import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import vfile from 'vfile'
import html from 'remark-html'
import { PostData, PostDataWithContent } from '../type/PostData'
import { PostId } from '../type/PostId'

// The process.cwd() method returns the current working directory of the Node.js process.
const postsDirectory: string = path.join(process.cwd(), 'posts')

export function getSortedPostsData(): PostData[] {
  // Get file names under /posts
  const fileNames: string[] = fs.readdirSync(postsDirectory)
  const allPostsData: PostData[] = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id: string = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath: string = path.join(postsDirectory, fileName)
    const fileContents: string = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult: matter.GrayMatterFile<string> = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as { date: string; title: string })
    }
  })
  // Sort posts by date
  return allPostsData.sort((a: PostData, b: PostData) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllPostIds(): PostId[] {
  const fileNames: string[] = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getPostData(id: string): Promise<PostDataWithContent> {
  const fullPath: string = path.join(postsDirectory, `${id}.md`)
  const fileContents: string = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult: matter.GrayMatterFile<string> = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent: vfile.VFile = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml: string = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string })
  }
}
