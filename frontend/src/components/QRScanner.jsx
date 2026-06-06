import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = () => {
  // Refs to hold DOM elements
  const scannerRef = useRef(null);
  const previewRef = useRef(null);

  // State for managing scan results and messages
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Function to send data to the backend
  const sendToBackend = async (qrData) => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch('http://localhost:5000/api/process-qr', { // Adjust port if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: qrData }),
        credentials: 'include' // Important if you use cookies/sessions for auth
      });

      const result = await response.json();

      if (response.ok) {
        // Success! Do something with the response
        setScanResult({ data: qrData, serverResponse: result });
        console.log('Server response:', result);
        alert(`Success! ${result.message}`);
      } else {
        // Server responded with an error (e.g., 404, 500)
        throw new Error(result.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending QR data to server:', error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Function to start the QR scanner
  const startScanner = () => {
    // Clear previous results and errors
    setScanResult(null);
    setError(null);
    setIsScanning(true);

    // Configuration for the scanner
    const config = { 
      fps: 10, // Frames per second to scan
      qrbox: { width: 250, height: 250 }, // Size of the scanning box
      rememberLastUsedCamera: true, // Remember user's camera choice
      supportedScanTypes: [] // Optional: specify scan types if needed
    };

    // Initialize the scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRef.current.id, // ID of the div to render the scanner
      config,
      false // Verbose mode - set to true if you want debug logs
    );

    // Function to handle successful scans
    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`Scan result: ${decodedText}`, decodedResult);
      
      // Stop the scanner after a successful scan
      html5QrcodeScanner.clear();
      setIsScanning(false);
      
      // Send the decoded data to your backend server
      sendToBackend(decodedText);
    };

    // Function to handle scan failures
    const onScanFailure = (error) => {
      // Most errors are just internal parsing errors, we can ignore them
      // console.warn('Scan error (usually not critical):', error);
    };

    // Render the scanner and attach handlers
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    // Cleanup function to stop the scanner if component unmounts
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  };

  // Function to stop the scanner manually
  const stopScanner = () => {
    // The scanner is already cleared on successful scan, but this is a manual override
    const scannerElement = document.getElementById('qr-scanner');
    if (scannerElement && scannerElement.innerHTML) {
      scannerElement.innerHTML = ''; // Brutal but effective way to clear
    }
    setIsScanning(false);
  };

  // useEffect to start the scanner when the component mounts
  useEffect(() => {
    startScanner();

    // Cleanup on component unmount
    return () => {
      stopScanner();
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>QR Code Scanner</h2>
      
      {/* Error Display */}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Scanner Container */}
      <div 
        ref={scannerRef} 
        id="qr-scanner"
        style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
      />
      
      {/* Manual Controls */}
      <div style={{ marginTop: '20px' }}>
        {isScanning ? (
          <button onClick={stopScanner} style={{ padding: '10px 20px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Stop Scanner
          </button>
        ) : (
          <button onClick={startScanner} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Start Scanner
          </button>
        )}
      </div>

      {/* Scan Result Display */}
      {scanResult && (
        <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '5px' }}>
          <h3>Scan Successful!</h3>
          <p><strong>Scanned Data:</strong> {scanResult.data}</p>
          {scanResult.serverResponse && (
            <p><strong>Server Message:</strong> {scanResult.serverResponse.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QrScanner;