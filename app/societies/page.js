'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const ICONS = {
  gaming: '🎮', tech: '💻', sports: '⚽', art: '🎨', music: '🎵', islamic: '🕌',
}

function getIcon(name = '') {
  const n = name.toLowerCase()
  for (const [k, v] of Object.entries(ICONS)) if (n.includes(k)) return v
  return '👥'
}

export default function SocietiesPage() {
  const [societies, setSocieties] = useState([])
  const [members, setMembers] = useState([])
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ studentId: '', studentName: '', societyId: '' })
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchSocieties()
    fetchMembers()
  }, [])

  async function fetchSocieties() {
    const { data } = await supabase.from('societies').select('*').order('society_id')
    setSocieties(data || [])
  }

  async function fetchMembers() {
    const { data } = await supabase.from('society_members').select('*').order('membership_id', { ascending: false })
    setMembers(data || [])
  }

  async function joinSociety(e) {
    e.preventDefault()
    const { studentId, studentName, societyId } = form

    if (!studentId || !studentName || !societyId) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' }); return
    }

    const { data: existing } = await supabase.from('society_members')
      .select('*').eq('student_id', studentId).eq('society_id', societyId)

    if (existing?.length > 0) {
      setMessage({ text: 'You have already joined this society.', type: 'error' }); return
    }

    const { error } = await supabase.from('society_members').insert([{
      student_id: studentId, student_name: studentName, society_id: Number(societyId)
    }])

    if (error) { setMessage({ text: 'Failed: ' + error.message, type: 'error' }); return }

    setForm({ studentId: '', studentName: '', societyId: '' })
    setMessage({ text: 'You joined the society successfully!', type: 'success' })
    await fetchMembers()
  }

  async function leaveSocket(membershipId) {
    const { error } = await supabase.from('society_members').delete().eq('membership_id', membershipId)
    if (error) { alert('Failed to leave society.'); return }
    setMessage({ text: 'You left the society.', type: 'success' })
    await fetchMembers()
  }

  const filtered = filter === 'all' ? members : members.filter(m => String(m.society_id) === filter)
  const getSocietyName = id => societies.find(s => s.society_id === id)?.society_name ?? 'Unknown'

  return (
    <div className="container">

      {/* INTRO */}
      <section className="hero-section" style={{ display: 'block' }}>
        <h2>Student Societies</h2>
        <p style={{ color: '#555' }}>Explore societies, join communities, and connect with other students.</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* JOIN FORM */}
        <section className="form-section">
          <h3>Join a Society</h3>
          <form onSubmit={joinSociety}>
            <div className="form-group">
              <label htmlFor="sStudentId">Student ID</label>
              <input id="sStudentId" type="number" value={form.studentId}
                onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="sStudentName">Student Name</label>
              <input id="sStudentName" type="text" value={form.studentName}
                onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="sSocietySelect">Select Society</label>
              <select id="sSocietySelect" value={form.societyId}
                onChange={e => setForm(f => ({ ...f, societyId: e.target.value }))} required>
                <option value="">Choose a society</option>
                {societies.map(s => (
                  <option key={s.society_id} value={s.society_id}>{s.society_name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
              Join Society
            </button>
            {message.text && (
              <p style={{ marginTop: 12, color: message.type === 'error' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                {message.text}
              </p>
            )}
          </form>
        </section>

        {/* SOCIETIES LIST */}
        <section className="table-section">
          <h3>Available Societies</h3>
          {societies.map(s => {
            const count = members.filter(m => m.society_id === s.society_id).length
            return (
              <div key={s.society_id} style={{ borderBottom: '1px solid #eee', paddingBottom: 14, marginBottom: 14 }}>
                <strong style={{ fontSize: 16 }}>{getIcon(s.society_name)} {s.society_name}</strong>
                <span style={{ marginLeft: 8, background: '#e8e8ff', color: '#0b0b9e', borderRadius: 999, padding: '2px 10px', fontSize: 12 }}>
                  {s.category}
                </span>
                <p style={{ color: '#555', margin: '6px 0 2px', fontSize: 14 }}>{s.description}</p>
                <p style={{ fontSize: 13, color: '#666' }}>📅 {s.meeting_day} &nbsp;|&nbsp; 📧 {s.contact_email} &nbsp;|&nbsp; 👥 {count} members</p>
              </div>
            )
          })}
        </section>

      </div>

      {/* MEMBERS TABLE */}
      <section className="table-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Society Members</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 5 }}>
            <option value="all">All Societies</option>
            {societies.map(s => (
              <option key={s.society_id} value={String(s.society_id)}>{s.society_name}</option>
            ))}
          </select>
        </div>
        <table>
          <thead>
            <tr><th>Student ID</th><th>Name</th><th>Society</th><th>Join Date</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5} style={{ color: '#888', fontStyle: 'italic' }}>No members yet.</td></tr>
              : filtered.map(m => (
                <tr key={m.membership_id}>
                  <td>{m.student_id}</td>
                  <td>{m.student_name}</td>
                  <td>{getSocietyName(m.society_id)}</td>
                  <td>{m.join_date}</td>
                  <td><button className="btn-delete" onClick={() => leaveSocket(m.membership_id)}>Leave</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>

    </div>
  )
}
