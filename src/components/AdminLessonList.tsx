'use client'

import { useState, useTransition } from 'react'
import {
  deleteLesson,
  reorderLessons,
  updateLesson,
} from '@/app/admin/actions'

export type AdminLessonItem = {
  id: string
  title: string
  youtube_url: string | null
  text_content: string | null
  duration_seconds: number
  position: number
}

export default function AdminLessonList({
  courseId,
  initialLessons,
}: {
  courseId: string
  initialLessons: AdminLessonItem[]
}) {
  const [lessons, setLessons] = useState<AdminLessonItem[]>(initialLessons)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function saveOrder(nextLessons: AdminLessonItem[]) {
    setLessons(nextLessons)
    startTransition(async () => {
      await reorderLessons(
        courseId,
        nextLessons.map((l) => l.id)
      )
    })
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return

    const fromIndex = lessons.findIndex((l) => l.id === draggedId)
    const toIndex = lessons.findIndex((l) => l.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const updated = lessons.slice()
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)

    setDraggedId(null)
    saveOrder(updated)
  }

  function moveLesson(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= lessons.length) return

    const updated = lessons.slice()
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    saveOrder(updated)
  }

  if (lessons.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No lessons in this module yet. Add one below.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Drag lessons to reorder (or use ↑ / ↓ on mobile)</span>
        {isPending && <span className="text-emerald-700">Saving order...</span>}
      </div>

      <ul className="space-y-2">
        {lessons.map((lesson, idx) => {
          const isEditing = editingId === lesson.id

          return (
            <li
              key={lesson.id}
              draggable={!isEditing}
              onDragStart={() => setDraggedId(lesson.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(lesson.id)}
              className={`rounded-lg border p-3 transition ${
                draggedId === lesson.id
                  ? 'border-slate-900 bg-slate-100 opacity-70 dark:border-white dark:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50'
              }`}
            >
              {isEditing ? (
                <form
                  action={async (formData) => {
                    await updateLesson(formData)
                    setEditingId(null)
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="lessonId" value={lesson.id} />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Lesson Title *
                      </label>
                      <input
                        name="title"
                        required
                        defaultValue={lesson.title}
                        className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Duration (minutes)
                      </label>
                      <input
                        name="duration_minutes"
                        type="number"
                        min={0}
                        defaultValue={Math.round((lesson.duration_seconds || 0) / 60)}
                        className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Unlisted YouTube URL
                    </label>
                    <input
                      name="youtube_url"
                      defaultValue={lesson.youtube_url ?? ''}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Lesson Text Content / Notes
                    </label>
                    <textarea
                      name="text_content"
                      rows={3}
                      defaultValue={lesson.text_content ?? ''}
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      Save Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="cursor-grab select-none text-slate-400"
                      title="Drag to reorder"
                    >
                      ⋮⋮
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {idx + 1}. {lesson.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {Math.round((lesson.duration_seconds || 0) / 60)}m •{' '}
                        {lesson.youtube_url ? 'YouTube attached' : 'Text only'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveLesson(idx, -1)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx === lessons.length - 1}
                      onClick={() => moveLesson(idx, 1)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(lesson.id)}
                      className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <form action={deleteLesson}>
                      <input type="hidden" name="courseId" value={courseId} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <button
                        type="submit"
                        className="rounded border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
