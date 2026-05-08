"use client";

import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { allUserStore } from "@/stores/allUserStore"; 

const CsvUpload = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const success = await allUserStore.uploadEmployeesCSV(file); // 
      if (success) {
        alert("CSV uploaded successfully ✅");
        await allUserStore.fetchUsers(); //  refresh user list
      } else {
        alert("CSV upload failed ❌");
      }
    } catch (err) {
      console.error("CSV upload failed:", err);
      alert("CSV upload failed ❌");
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="p-4 border rounded-xl my-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-[#8E51FF] mb-2">
        Upload Employees CSV
      </h3>
      <div className="flex items-center gap-2">
        <input type="file" accept=".csv" onChange={handleChange} />
        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="ml-2 bg-[#8E51FF] hover:bg-[#733acc] text-white rounded-lg"
        >
          {loading ? "Uploading..." : "Upload CSV"}
        </Button>
      </div>
    </div>
  );
});

export default CsvUpload;
