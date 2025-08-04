// src/components/RawMaterials.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const RawMaterials = () => {
  const [groupedData, setGroupedData] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const grouped = {};

        data.forEach((item) => {
          const material = item['Raw Material Name']?.trim();
          if (material) {
            if (!grouped[material]) {
              grouped[material] = [];
            }
            grouped[material].push(item);
          }
        });

        setGroupedData(grouped);
      }
    });
  };

  return (
    <div className="p-4">
      <Typography variant="h5" gutterBottom>
        Upload Raw Material File
      </Typography>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginBottom: '20px' }}
      />

      {Object.keys(groupedData).length > 0 ? (
        Object.entries(groupedData).map(([material, rows], index) => (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{material}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(rows[0]).map((key, idx) => (
                        <TableCell key={idx}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.keys(row).map((key, colIndex) => (
                          <TableCell key={colIndex}>{row[key]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body1">No data uploaded yet.</Typography>
      )}
    </div>
  );
};

export default RawMaterials;
