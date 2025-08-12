import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DispatchDelivery = ({ apiUrl }) => {
  const [formData, setFormData] = useState({ /* same as before */ });
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${apiUrl}/api/dispatch-delivery`);
        setDeliveries(res.data);
      } catch (err) {
        setError("Failed to load deliveries.");
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, [apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await axios.post(`${apiUrl}/api/dispatch-delivery`, formData);
      setDeliveries(prev => [res.data, ...prev]);
      setSuccessMsg("Delivery recorded successfully!");
      setFormData({ item: '', quantity: '', date: '', customer: '', driver: '', vehicle: '' });
    } catch (err) {
      setError("Failed to save delivery.");
    } finally {
      setLoading(false);
    }
  };

  // ...rest stays the same, use formData and deliveries from state
};
