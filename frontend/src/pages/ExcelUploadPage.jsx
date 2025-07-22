import React, { useState, useRef, useEffect } from 'react';
import { FileUp } from "lucide-react";
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import * as XLSX from 'xlsx';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { LineElement, PointElement, ArcElement } from 'chart.js';
import Plot from 'react-plotly.js';
import Chart from 'chart.js/auto';
import { useDispatch } from 'react-redux';
import { uploadFile } from '../store/dashboard-slice/dashboardSlice';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.register(LineElement, PointElement, ArcElement);

export default function ExcelUploadPage() {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

  const dispatch = useDispatch();
  
  // for x,y,chart type
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');

  // 3d graph
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [zCol, setZCol] = useState('');

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // for x,y,chart type
      const workbook2 = XLSX.read(event.target.result, { type: 'binary' });
      const worksheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
      const jsonData2 = XLSX.utils.sheet_to_json(worksheet2);
      setData(jsonData2);

      // for 3d
      const workbook3 = XLSX.read(data, { type: 'array' });
      const worksheet3 = workbook3.Sheets[workbook3.SheetNames[0]];
      const jsonData3 = XLSX.utils.sheet_to_json(worksheet3);

      const columns = Object.keys(jsonData[0]);
      setHeaders(columns);
      setExcelData(jsonData3);
      // end for 3d

      if (!jsonData.length) {
        toast.error("Excel file is empty or unreadable.");
        return;
      }

      // for x,y,chart type
      if (jsonData.length > 0) {
        setColumns(Object.keys(jsonData[0]));
      }

      const firstRow = jsonData[0];
      const keys = Object.keys(firstRow);

      if (keys.length < 2) {
        toast.error("Excel must contain at least 2 columns.");
        return;
      }

      // First column as label
      const labelKey = keys[0];
      const labels = jsonData.map(row => row[labelKey]);

      // All other numeric columns as datasets
      const numericKeys = keys.filter(key =>
        typeof firstRow[key] === 'number' || !isNaN(Number(firstRow[key]))
      ).filter(key => key !== labelKey);

      if (!numericKeys.length) {
        toast.error("No numeric columns found for charting.");
        return;
      }

      const colors = ['#60a5fa', '#34d399', '#facc15', '#f472b6', '#a78bfa', '#f87171'];

      const datasets = numericKeys.map((key, index) => ({
        label: key,
        data: jsonData.map(row => Number(row[key])),
        backgroundColor: colors[index % colors.length],
        borderRadius: 5,
      }));

      setChartData({
        labels,
        datasets,
      });

      toast.success("Chart generated successfully!");
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadFileFn = async (file) => {
    try {

      dispatch(uploadFile(file));    
        
    } catch (error) {
      toast.error(error.response?.data?.message || "upload file failed");
      console.log(error)
    
    }

  }
  // for x,y,chart type
  const getChartData = () => {
    if (!xAxis || !yAxis || data.length === 0) return {};

    const labels = data.map((item) => item[xAxis]);
    const values = data.map((item) => item[yAxis]);

    const dynamicColors = labels.map((_, i) =>
      `hsl(${(i * 360) / labels.length}, 70%, 60%)`
    );

    return {
      labels,
      datasets: [
        {
          label: `${yAxis} vs ${xAxis}`,
          data: values,
          backgroundColor: chartType === 'pie' ? dynamicColors : 'rgba(34,197,94,0.6)',
          borderColor: chartType === 'pie' ? '#fff' : 'rgba(34,197,94,1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const renderChart = () => {
    const chartData = getChartData();
    const options = {
      responsive: true,
      maintainAspectRatio: false, 
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: `${yAxis} vs ${xAxis}` },
      },
    };

    const chartStyle = { height: '400px' }; 

    switch (chartType) {
      case 'bar':
        return <div style={chartStyle}><Bar data={chartData} options={options} ref={chartRef2}/></div>;
      case 'line':
        return <div style={chartStyle}><Line data={chartData} options={options} ref={chartRef2}/></div>;
      case 'pie':
        return <div style={chartStyle}><Pie data={chartData} options={options} ref={chartRef2}/></div>;
      default:
        return <p>Invalid chart type</p>;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      parseExcel(file);
      uploadFileFn(file)
    } else {
      toast.error("Please upload a valid .xlsx file");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      parseExcel(file);
      uploadFileFn(file);
    } else {
      toast.error("Please upload a valid .xlsx file");
    }
  };

  const generate3DBars = () => {
    if (!xCol || !yCol || !zCol || excelData.length === 0) return null;
  
    const bars = excelData.flatMap((row) => {
      const x = row[xCol];
      const y = row[yCol];
      const z = row[zCol];
  
      return [{
        type: 'scatter3d',
        mode: 'lines',
        x: [x, x],
        y: [y, y],
        z: [0, z],
        line: {
          width: 10,
          color: z,
          colorscale: 'Viridis'
        },
        showlegend: false
      }];
    });
  
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
        <Plot
          data={bars}
          layout={{
            title: '3D Bar Graph',
            autosize: true,
            margin: { l: 0, r: 0, b: 0, t: 50 },
            scene: {
              xaxis: { title: xCol },
              yaxis: { title: yCol },
              zaxis: { title: zCol }
            }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      </div>
    );
  };

  const downloadChart1 = () => {
    const chartInstance = chartRef1.current;
    
    if (!chartInstance) {
      console.error('Chart instance not found');
      toast.error("Chart instance not found")
      return;
    }

    const base64Image = chartInstance.toBase64Image(); // PNG by default
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = 'chart.png';
    link.click();
  };

  const downloadChart2 = () => {
    const chartInstance = chartRef2.current;

    if (!chartInstance) {
      console.error('Chart instance not found');
      toast.error("Chart instance not found")
      return;
    }

    const base64Image = chartInstance.toBase64Image(); // PNG by default
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = 'chart.png';
    link.click();
  };

  useEffect(() => {
    if (chartData && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chartData]);

  useEffect(() => {
    if (xAxis && yAxis && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [xAxis, yAxis, xCol, yCol, zCol]);


  const handleDragOver = (e) => e.preventDefault();

  return (
    <div >
      <Header title={"Upload"} />
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 text-gray-800 px-6">
        <div className="md:w-1/2 text-center space-y-4">
          <h1 className="text-4xl font-bold">Upload Your Excel File</h1>
          <p className="text-lg text-gray-600">Start analyzing your data by uploading an Excel spreadsheet.</p>
        </div>

        <div
          className="md:w-1/2 mt-8 md:mt-0 flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white shadow-lg"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label className="flex flex-col items-center cursor-pointer">
            <FileUp className='text-green-500 text-[10rem] h-18 w-18' />
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-gray-600">Drag and drop a file here, or click to select a file</p>
          </label>
        </div>
      </div>

      {chartData && (<div className='bg-gray-200 py-8 min-h-screen' ref={chartRef}>

        <div className="max-w-6xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md h-[400px] md:h-[500px] lg:h-[600px]">
          <h2 className="text-2xl font-bold mb-4 text-center">Generated Chart</h2>
          <Bar ref={chartRef1} data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false, 
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Auto-detected Multi-Column Data' },
              },
            }}
          />

          <div className="text-center my-4">
            <button onClick={downloadChart1} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
              Download Chart
            </button>
          </div>
        </div>
      </div>)}

      {columns.length > 0 && (<div className="p-6 space-y-6 bg-gray-100" ref={chartRef}>

        <div className=" mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">

            <div className="w-full md:w-1/3">
              <label className="block mb-1 font-semibold">Select X-Axis</label>
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="border p-2 w-full rounded">
                <option value="">Select X-Axis</option>
                {columns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block mb-1 font-semibold">Select Y-Axis</label>
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="border p-2 w-full rounded">
                <option value="">Select Y-Axis</option>
                {columns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block mb-1 font-semibold">Select Chart Type</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="border p-2 w-full rounded">
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-4 shadow rounded-lg mt-4">
            {xAxis && yAxis ? renderChart() : <p>Select both X and Y axes to render the chart.</p>}
          </div>
        </div>

        <div className="text-center mt-4">
          {xAxis && yAxis ? <button onClick={downloadChart2} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Download Chart
          </button> : null}
        </div>

      </div>)}

      {/* 3d chart */}
      {headers.length > 0 && (<div className="p-4 bg-gray-200 space-y-4" ref={chartRef}>
        <h1 className='text-lg  lg:text-4xl font-semibold text-center'>3D Chart</h1>
        <div className=' mx-auto space-y-4'>
          <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">

            <div className="w-full md:w-1/3">
              <label className="block mb-1 font-semibold">Select X-Axis</label>
              <select value={xCol} onChange={(e) => setXCol(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Select X Axis</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block mb-1 font-semibold">Select Y-Axis</label>
              <select value={yCol} onChange={(e) => setYCol(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Select Y Axis</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block mb-1 font-semibold">Select Z-Axis</label>
              <select value={zCol} onChange={(e) => setZCol(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Select Z Axis (Height)</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

          </div>

        </div>

        <div className="mt-6 bg-white p-4 shadow rounded-lg">
          {xCol && yCol && zCol ? generate3DBars(): <p>Select both X ,Y and Z axes to render the chart.</p>}</div>
      </div>)}

    </div>
  );
}


