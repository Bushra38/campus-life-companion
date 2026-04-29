'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SupportPage() {
  const [queries, setQueries] = useState([])
  const [status, setStatus] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', feedbackType: 'Events', query: '' })

  useEffect(() => { loadSupport() }, [])

  async function loadSupport() {
    const { data, error } = await supabase
      .from('support')
      .select('id, name, feedback_type, support_query, date_raised')
      .order('id', { ascending: true })

    if (error) { setStatus('Error loading data: ' + error.message); return }
    setQueries(data || [])
  }

  async function saveSupport(e) {
    e.preventDefault()
    const { name, feedbackType, query } = form

    if (!name || !feedbackType || !query) {
      setStatus('Please fill in all fields.'); return
    }

    setStatus('Saving...')

    const result = editingId
      ? await supabase.from('support').update({ name, feedback_type: feedbackType, support_query: query }).eq('id', Number(editingId))
      : await supabase.from('support').insert([{ name, feedback_type: feedbackType, support_query: query }])

    if (result.error) { setStatus('Save failed: ' + result.error.message); return }

    setEditingId(null)
    setForm({ name: '', feedbackType: 'Events', query: '' })
    setStatus(editingId ? 'Query updated.' : 'Query submitted.')
    await loadSupport()
  }

  function editQuery(q) {
    setEditingId(q.id)
    setForm({ name: q.name, feedbackType: q.feedback_type, query: q.support_query })
    setStatus('Editing query ' + q.id)
  }

  async function deleteQuery(id) {
    if (!confirm(`Delete query ${id}?`)) return
    setStatus('Deleting...')
    const { error } = await supabase.from('support').delete().eq('id', id)
    if (error) { setStatus('Delete failed: ' + error.message); return }
    setStatus('Query deleted.')
    await loadSupport()
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>Support Desk</h2>

      {/* FORM */}
      <section className="form-section">
        <h3>{editingId ? 'Edit Query' : 'Submit Help Request'}</h3>
        <form onSubmit={saveSupport} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <div className="form-group">
            <label htmlFor="name">Student Name</label>
            <input id="name" type="text" placeholder="Enter your name"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="feedbackType">Feedback Type</label>
            <select id="feedbackType" value={form.feedbackType}
              onChange={e => setForm(f => ({ ...f, feedbackType: e.target.value }))}>
              <option>Events</option>
              <option>Societies</option>
              <option>Bookings</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="query">Support Query</label>
            <textarea id="query" rows={5} placeholder="Type your query message"
              value={form.query} onChange={e => setForm(f => ({ ...f, query: e.target.value }))} required />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12 }}>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Query' : 'Submit'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary"
                onClick={() => { setEditingId(null); setForm({ name: '', feedbackType: 'Events', query: '' }) }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* TABLE */}
      <section className="table-section">
        <h3>Support Queries</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Type</th><th>Query</th><th>Date</th><th>Edit</th><th>Delete</th></tr>
          </thead>
          <tbody>
            {queries.length === 0
              ? <tr><td colSpan={7}>No queries found.</td></tr>
              : queries.map(q => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.name}</td>
                  <td>{q.feedback_type}</td>
                  <td>{q.support_query}</td>
                  <td>{new Date(q.date_raised).toLocaleString()}</td>
                  <td><button className="btn-edit" onClick={() => editQuery(q)}>Edit</button></td>
                  <td><button className="btn-delete" onClick={() => deleteQuery(q.id)}>Delete</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>

      <div className="status">{status}</div>
    </div>
  )
}
