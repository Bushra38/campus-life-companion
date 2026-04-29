'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ roomName: '', capacity: '', floor: '', status: '' })

  useEffect(() => { loadRooms() }, [])

  async function loadRooms() {
    const { data, error } = await supabase.from('rooms').select('*').order('room_id', { ascending: true })
    if (error) { setStatus('Error loading rooms: ' + error.message); return }
    setRooms(data || [])
  }

  async function saveRoom(e) {
    e.preventDefault()
    const { roomName, capacity, floor, roomStatus } = form

    if (!roomName || !capacity || floor === '' || !roomStatus) {
      setStatus('Please fill in all fields.'); return
    }

    if (editId === null) {
      const { error } = await supabase.from('rooms').insert([{
        room_name: roomName, capacity: Number(capacity),
        floor: Number(floor), status: roomStatus
      }])
      if (error) { setStatus('Error adding room: ' + error.message); return }
      setStatus('Room added successfully.')
    } else {
      const { error } = await supabase.from('rooms').update({
        room_name: roomName, capacity: Number(capacity),
        floor: Number(floor), status: roomStatus
      }).eq('room_id', editId)
      if (error) { setStatus('Error updating room: ' + error.message); return }
      setStatus('Room updated successfully.')
    }

    resetForm()
    await loadRooms()
  }

  function editRoom(room) {
    setEditId(room.room_id)
    setForm({ roomName: room.room_name, capacity: String(room.capacity), floor: String(room.floor), roomStatus: room.status })
    setStatus('Editing room ' + room.room_name)
  }

  async function deleteRoom(room) {
    if (!confirm(`Delete "${room.room_name}"?`)) return
    const { error } = await supabase.from('rooms').delete().eq('room_id', room.room_id)
    if (error) { setStatus('Error deleting room: ' + error.message); return }
    setStatus('Room deleted.')
    await loadRooms()
  }

  function resetForm() {
    setEditId(null)
    setForm({ roomName: '', capacity: '', floor: '', roomStatus: '' })
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>Library Room Management</h2>

      {/* FORM */}
      <section className="form-section">
        <h3>{editId ? 'Edit Room' : 'Add New Room'}</h3>
        <form onSubmit={saveRoom} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <div className="form-group">
            <label htmlFor="roomName">Room Name</label>
            <input id="roomName" type="text" placeholder="Enter room name"
              value={form.roomName} onChange={e => setForm(f => ({ ...f, roomName: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="capacity">Capacity</label>
            <input id="capacity" type="number" placeholder="Enter capacity" min="1"
              value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="floor">Floor</label>
            <input id="floor" type="number" placeholder="Enter floor number" min="0"
              value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="roomStatus">Availability</label>
            <select id="roomStatus" value={form.roomStatus || ''}
              onChange={e => setForm(f => ({ ...f, roomStatus: e.target.value }))} required>
              <option value="">Select status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12 }}>
            <button type="submit" className="btn-primary">{editId ? 'Update Room' : 'Add Room'}</button>
            {editId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel Edit</button>
            )}
          </div>
        </form>
      </section>

      {/* TABLE */}
      <section className="table-section">
        <h3>All Rooms</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Capacity</th><th>Floor</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rooms.length === 0
              ? <tr><td colSpan={6}>Loading rooms…</td></tr>
              : rooms.map(room => (
                <tr key={room.room_id}>
                  <td>{room.room_id}</td>
                  <td>{room.room_name}</td>
                  <td>{room.capacity}</td>
                  <td>{room.floor}</td>
                  <td>{room.status}</td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="btn-edit" onClick={() => editRoom(room)}>Edit</button>
                    <button className="btn-delete" onClick={() => deleteRoom(room)}>Delete</button>
                  </td>
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
