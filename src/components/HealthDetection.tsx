
/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useState, useCallback, Fragment } from 'react';
import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Heart,
  Activity,
  FileImage
} from "lucide-react";

const HealthDetection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Mock analysis results
  const mockAnalysis = {
    healthScore: 85,
    status: "healthy",
    confidence: 92,
    issues: [
      { 
        type: "warning", 
        severity: "medium",
        title: "Sedikit perubahan warna sisik",
        description: "Terdeteksi perubahan warna pada 12% area tubuh ikan. Kemungkinan stress ringan atau perubahan kualitas air.",
        recommendation: "Monitor kualitas air dan kurangi kepadatan ikan jika perlu."
      }
    ],
    characteristics: [
      { label: "Warna Sisik", value: "Normal", status: "good" },
      { label: "Aktivitas Gerak", value: "Aktif", status: "good" },
      { label: "Kondisi Sirip", value: "Baik", status: "good" },
      { label: "Mata", value: "Jernih", status: "good" },
      { label: "Nafsu Makan", value: "Kurang", status: "warning" }
    ]
  };

  const recentAnalyses = [
    {
      id: 1,
      date: "2024-01-15 14:30",
      pond: "Kolam A",
      result: "Sehat",
      score: 92,
      image: "/api/placeholder/100/100"
    },
    {
      id: 2,
      date: "2024-01-15 10:15", 
      pond: "Kolam B",
      result: "Perlu Perhatian",
      score: 75,
      image: "/api/placeholder/100/100"
    },
    {
      id: 3,
      date: "2024-01-14 16:45",
      pond: "Kolam C", 
      result: "Sehat",
      score: 88,
      image: "/api/placeholder/100/100"
    }
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    // Simulate AI processing time
    setTimeout(() => {
      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 3000);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Deteksi Kesehatan Ikan AI</h2>
        <p className="text-gray-600 mt-1">Upload foto atau video ikan untuk analisis kesehatan otomatis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Upload Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <span>Upload Gambar Ikan</span>
            </CardTitle>
            <CardDescription>
              Drag & drop gambar atau klik untuk memilih file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-blue-400 bg-blue-50/50" 
                  : "border-gray-300 bg-gray-50/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded fish" 
                    className="mx-auto max-h-48 rounded-lg"
                  />
                  <Button 
                    onClick={() => {
                      setUploadedImage(null);
                      setAnalysisResult(null);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Upload Gambar Lain
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop gambar di sini
                    </p>
                    <p className="text-sm text-gray-500">
                      atau klik untuk memilih file
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild className="cursor-pointer">
                      <span>Pilih Gambar</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  <div>
                    <p className="font-medium text-blue-800">Menganalisis gambar...</p>
                    <p className="text-sm text-blue-600">AI sedang memproses deteksi kesehatan ikan</p>
                  </div>
                </div>
                <Progress value={75} className="mt-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Hasil Analisis</span>
                </div>
                <Badge className={`${getHealthBadge(analysisResult.healthScore)} text-white`}>
                  Skor: {analysisResult.healthScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50/50 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className={`text-2xl font-bold ${getHealthColor(analysisResult.healthScore)}`}>
                    {analysisResult.healthScore}%
                  </p>
                  <p className="text-xs text-gray-600">Kesehatan</p>
                </div>
                <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{analysisResult.confidence}%</p>
                  <p className="text-xs text-gray-600">Akurasi</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Karakteristik Ikan:</h4>
                {analysisResult.characteristics.map((char, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded">
                    <span className="text-sm text-gray-700">{char.label}:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{char.value}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        char.status === "good" ? "bg-green-500" : 
                        char.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>

              {analysisResult.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    Temuan & Rekomendasi:
                  </h4>
                  {analysisResult.issues.map((issue, index) => (
                    <div key={index} className="p-3 bg-yellow-50/50 rounded-lg border-l-4 border-yellow-400">
                      <h5 className="font-medium text-yellow-800">{issue.title}</h5>
                      <p className="text-sm text-yellow-700 mt-1">{issue.description}</p>
                      <p className="text-sm text-yellow-600 mt-2 font-medium">
                        💡 {issue.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Analyses */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Riwayat Analisis Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{analysis.pond}</Badge>
                    <span className="text-xs text-gray-500">{analysis.date}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <FileImage className="h-12 w-12 text-gray-400 bg-gray-100/50 p-2 rounded" />
                    <div>
                      <p className="font-medium text-gray-800">{analysis.result}</p>
                      <p className={`text-sm ${getHealthColor(analysis.score)}`}>
                        Skor: {analysis.score}%
                      </p>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full">
                    Lihat Detail
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips & Guidelines */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle>Tips Pengambilan Foto yang Baik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Pencahayaan
              </h4>
              <p className="text-sm text-gray-600">
                Gunakan cahaya natural atau lampu terang. Hindari bayangan pada ikan.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Jarak & Sudut
              </h4>
              <p className="text-sm text-gray-600">
                Ambil foto dari jarak 20-30cm dengan sudut 45° untuk hasil terbaik.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Kejelasan
              </h4>
              <p className="text-sm text-gray-600">
                Pastikan foto tidak blur dan ikan terlihat jelas tanpa gangguan objek lain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDetection;
