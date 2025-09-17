import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../api"; // centralized axios instance

// ✅ Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: auto;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Button = styled.button`
  grid-column: span 2;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background: #0056b3;
  }
`;

const DispatchList = styled.div`
  margin-top: 20px;
`;

const DispatchItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const DeleteBtn = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  &:hover {
    background: #b52a37;
  }
`;

// ✅ Helper for offline storage
const saveOffline = (dispatch) => {
  const saved = JSON.parse(localStorage.getItem("offlineDispatches") || "[]");
  saved.push(dispatch);
  localStorage.setItem("offlineDispatches", JSON.stringify(saved));
};

const syncOffline = async () => {
  const saved = JSON.parse(localStorage.getItem("offlineDispatches") || "[]");
  if (saved.length === 0) return;
  for (let d of saved) {
    try {
      await api.post("/dispatch-delivery", d);
    } catch (err) {
      console.error("Still offline, keeping unsynced data");
      return;
    }
  }
  localStorage.removeItem("offlineDispatches");
};

// ✅ Main Component
const DispatchDeliveryFactory = ({ personnelList = [] }) => {
  const [dispatches, setDispatches] = useState([]);
  const [form, setForm] = useState({ vehicle: "", weight: "", date: "", customer: "", driver: "" });

  // Fetch dispatches on load
  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const res = await api.get("/dispatch-delivery");
        setDispatches(res.data);
      } catch (err) {
        console.error("Fetch error, loading from localStorage");
        const saved = JSON.parse(localStorage.getItem("offlineDispatches") || "[]");
        setDispatches(saved);
      }
    };

    fetchDispatches();
    syncOffline();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit dispatch
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/dispatch-delivery", form);
      setDispatches([res.data, ...dispatches]);
    } catch (err) {
      console.error("Offline, saving locally");
      saveOffline(form);
      setDispatches([form, ...dispatches]);
    }
    setForm({ vehicle: "", weight: "", date: "", customer: "", driver: "" });
  };

  // Delete dispatch
  const handleDelete = async (id, idx) => {
    try {
      await api.delete(`/dispatch-delivery/${id}`);
      setDispatches(dispatches.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Delete failed (offline?)");
      // fallback: remove by index
      const updated = [...dispatches];
      updated.splice(idx, 1);
      setDispatches(updated);
    }
  };

  return (
    <Container>
      <Title>Dispatch & Delivery</Title>
      <Form onSubmit={handleSubmit}>
        <Input type="text" name="vehicle" placeholder="Vehicle Number" value={form.vehicle} onChange={handleChange} required />
        <Input type="number" name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} required />
        <Input type="date" name="date" value={form.date} onChange={handleChange} required />
        <Input type="text" name="customer" placeholder="Customer" value={form.customer} onChange={handleChange} required />
        <Select name="driver" value={form.driver} onChange={handleChange} required>
          <option value="">Select Driver</option>
          {personnelList.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </Select>
        <Button type="submit">Add Dispatch</Button>
      </Form>

      <DispatchList>
        {dispatches.map((d, idx) => (
          <DispatchItem key={d._id || idx}>
            <span>{d.vehicle} – {d.weight}kg – {d.customer} ({d.driver})</span>
            <DeleteBtn onClick={() => handleDelete(d._id, idx)}>X</DeleteBtn>
          </DispatchItem>
        ))}
      </DispatchList>
    </Container>
  );
};

export default DispatchDeliveryFactory;
