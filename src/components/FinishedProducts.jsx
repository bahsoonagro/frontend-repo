import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { Delete, Edit, Print } from "@mui/icons-material";
import axios from "axios";

export default function FinishedProducts() {
  const [products, setProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const printRef = useRef();

  // Fetch product data
  useEffect(() => {
    axios
      .get("/api/finished-products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...products].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setProducts(sorted);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Print handler with logo and branding
  const handlePrint = () => {
    const tableClone = printRef.current.cloneNode(true);

    // Remove "Action" column
    const headers = tableClone.querySelectorAll("th");
    headers.forEach((th, i) => {
      if (th.innerText.toLowerCase().includes("action")) {
        const colIndex = i;
        tableClone.querySelectorAll("tr").forEach((row) => {
          if (row.children[colIndex]) row.children[colIndex].remove();
        });
      }
    });

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const WinPrint = window.open("", "", "width=1000,height=700");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Bennimix Food Company - Finished Products Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 30px;
              color: #000;
            }
            header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            header img {
              width: 90px;
              height: auto;
            }
            header h1 {
              color: #1976d2;
              font-size: 24px;
              text-align: right;
              margin: 0;
            }
            h2 {
              text-align: center;
              font-size: 18px;
              color: #333;
              margin-bottom: 5px;
            }
            p {
              text-align: center;
              font-size: 14px;
              margin: 0 0 15px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px;
              text-align: center;
            }
            th {
              background-color: #1976d2;
              color: #fff;
            }
            footer {
              margin-top: 40px;
              font-size: 14px;
            }
            .signature {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature div {
              width: 45%;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <header>
            <img src="/bennimix_logo.png" alt="Bennimix Logo" />
            <h1>Bennimix Food Company</h1>
          </header>
          <h2>Finished Products Report</h2>
          <p>Printed on: ${formattedDate}</p>
          ${tableClone.outerHTML}
          <div class="signature">
            <div>
              ___________________________<br/>
              <strong>Prepared by:</strong>
            </div>
            <div style="text-align:right;">
              ___________________________<br/>
              <strong>Approved by:</strong>
            </div>
          </div>
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}>
        Finished Products
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} ref={printRef}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>
                <TableSortLabel
                  active={sortConfig.key === "name"}
                  direction={sortConfig.direction}
                  onClick={() => handleSort("name")}
                  sx={{ color: "white" }}
                >
                  Product Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "white" }}>Batch ID</TableCell>
              <TableCell sx={{ color: "white" }}>Quantity</TableCell>
              <TableCell sx={{ color: "white" }}>Unit</TableCell>
              <TableCell sx={{ color: "white" }}>
                <TableSortLabel
                  active={sortConfig.key === "date"}
                  direction={sortConfig.direction}
                  onClick={() => handleSort("date")}
                  sx={{ color: "white" }}
                >
                  Production Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "white" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.batchId}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{formatDate(product.date)}</TableCell>
                <TableCell>
                  <IconButton color="primary" size="small">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
