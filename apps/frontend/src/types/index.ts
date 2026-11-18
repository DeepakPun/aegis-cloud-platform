export interface User {
  _id: string
  email: string
  role: "user" | "admin"
}

export interface Project {
  _id: string
  title: string
  description: string
  techStack: string[]
  user: string
  createdAt: string
}
