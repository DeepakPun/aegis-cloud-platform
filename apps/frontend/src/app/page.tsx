"use client"

import { useState, useEffect, useSyncExternalStore, FormEvent } from "react"
import { User, Project } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// False on server and during hydration, true after hydration.
// Lets us hide user-dependent UI until the client has actually mounted.
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export default function Home() {
  const isMounted = useIsMounted()
  const [projects, setProjects] = useState<Project[]>([])

  // Initial state from localStorage, read during render, not in an effect
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("aegis_token")
  })

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    const saved = localStorage.getItem("aegis_user")
    if (!saved) return null
    try {
      return JSON.parse(saved) as User
    } catch {
      return null
    }
  })

  // Auth form state
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")

  // Project form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [techInput, setTechInput] = useState("")
  const [statusMsg, setStatusMsg] = useState("")

  // Fetch on mount and when token changes.
  // setState only happens inside .then / .catch callbacks, not synchronously in the effect.
  useEffect(() => {
    let cancelled = false
    const headers: HeadersInit = {}
    if (token) headers.Authorization = `Bearer ${token}`

    fetch(`${API_URL}/api/projects`, { headers })
      .then((res) => {
        if (res.status === 401) return null
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((data) => {
        if (!cancelled && data?.projects) setProjects(data.projects)
      })
      .catch(() => {
        if (!cancelled) setStatusMsg("Unable to reach backend API.")
      })

    return () => {
      cancelled = true
    }
  }, [token])

  // Only called from event handlers, never from an effect
  const fetchProjects = async () => {
    try {
      const headers: HeadersInit = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`${API_URL}/api/projects`, { headers })
      if (res.status === 401) return
      const data = await res.json()
      console.log(data)
      if (data.projects) setProjects(data.projects)
    } catch {
      setStatusMsg("Unable to reach backend API.")
    }
  }

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError("")
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login"

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed.")
        return
      }

      if (isRegister) {
        setIsRegister(false)
        setStatusMsg("Account created! Please log in.")
      } else {
        localStorage.setItem("aegis_token", data.token)
        localStorage.setItem("aegis_user", JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        setEmail("")
        setPassword("")
      }
    } catch {
      setAuthError("Network error connecting to API.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("aegis_token")
    localStorage.removeItem("aegis_user")
    setToken(null)
    setUser(null)
  }

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    const techStack = techInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, techStack }),
      })

      if (res.ok) {
        setTitle("")
        setDescription("")
        setTechInput("")
        fetchProjects()
      }
    } catch {
      setStatusMsg("Failed to create project.")
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) fetchProjects()
    } catch {
      setStatusMsg("Failed to delete project.")
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            SYSTEM // AEGIS_CLOUD_PLATFORM
          </span>
          <h1 className="text-3xl font-bold mt-1">
            Project Deployment Registry
          </h1>
        </div>

        {isMounted && user && (
          <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <div className="text-sm">
              <p className="font-medium">{user.email}</p>
              <p className="text-xs font-mono text-emerald-400 uppercase">
                Role: {user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded hover:bg-rose-500/30"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {statusMsg && (
        <div className="bg-emerald-950/60 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-lg text-sm">
          {statusMsg}
        </div>
      )}

      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        {!isMounted ? (
          <div className="h-40 animate-pulse bg-slate-800/50 rounded-lg" />
        ) : !user ? (
          <form onSubmit={handleAuth} className="max-w-md space-y-4">
            <h2 className="text-xl font-semibold">
              {isRegister ? "Create Operator Account" : "Operator Login"}
            </h2>
            {authError && <p className="text-sm text-rose-400">{authError}</p>}

            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-2 rounded-lg"
              >
                {isRegister ? "Register" : "Login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setAuthError("")
                }}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                {isRegister
                  ? "Already have an account? Login"
                  : "Need an account? Register"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateProject} className="space-y-4">
            <h2 className="text-xl font-semibold">Register New Project</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Title (e.g. EKS Cluster Automation)"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Tech Stack (comma-separated: AWS, Terraform, Docker)"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <textarea
              placeholder="Short project description..."
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-2 rounded-lg"
            >
              + Deploy Project Entry
            </button>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Active Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <p className="text-slate-400 text-sm">No projects registered yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((project) => {
              const canDelete =
                isMounted &&
                user &&
                (user._id === project.owner || user.role === "admin")
              return (
                <div
                  key={project._id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {project.title}
                      </h3>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-xs text-rose-400 hover:text-rose-300 px-4 py-1 cursor-pointer rounded border border-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(project.techStack || []).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono bg-slate-800 text-emerald-300 px-2.5 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
