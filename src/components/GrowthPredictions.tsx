
/** @jsxRuntime classic */
/** @jsx React.createElement */
/** @jsxFrag Fragment */
import React, { useState, Fragment } from 'react';
import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar, 
  Fish, 
  Target,
  BarChart3,
  Zap,
  AlertCircle
} from "lucide-react";

const GrowthPredictions = () => {
  const harvestPredictions = [
    {
      pond: "Kolam A",
      currentAge: 45,
      targetAge: 90,
      progress: 50,
      estimatedHarvest: "2024-03-15",
      predictedWeight: 2850,
      predictedCount: 2300,
      expectedYield: "6.555 ton",
      profitMargin: 35,
      recommendations: [
        "Pertahankan pola pakan saat ini",
        "Monitor kualitas air lebih ketat"
      ]
    },
    {
      pond: "Kolam B", 
      currentAge: 60,
      targetAge: 90,
      progress: 67,
      estimatedHarvest: "2024-02-28",
      predictedWeight: 3200,
      predictedCount: 2800,
      expectedYield: "8.960 ton",
      profitMargin: 42,
      recommendations: [
        "Siap untuk panen dalam 4 minggu",
        "Kurangi pakan bertahap mulai minggu depan"
      ]
    },
    {
      pond: "Kolam C",
      currentAge: 30,
      targetAge: 90, 
      progress: 33,
      estimatedHarvest: "2024-04-02",
      predictedWeight: 2200,
      predictedCount: 2100,
      expectedYield: "4.620 ton",
      profitMargin: 28,
      recommendations: [
        "Tingkatkan frekuensi pakan",
        "Pertimbangkan suplementasi vitamin"
      ]
    }
  ];

  const growthMetrics = [
    { label: "Rata-rata Pertumbuhan", value: "15g/hari", trend: "+2.3%", status: "good" },
    { label: "Total Biomassa", value: "18.2 ton", trend: "+5.7%", status: "good" },
    { label: "Survival Rate", value: "94%", trend: "+1.2%", status: "good" },
    { label: "FCR Rata-rata", value: "1.2", trend: "-0.1", status: "excellent" }
  ];

  const marketPredictions = {
    currentPrice: 16000,
    predictedPrice: 17500,
    priceChange: 9.4,
    marketTrend: "bullish",
    factors: [
      "Permintaan tinggi menjelang Ramadan",
      "Pasokan dari daerah lain menurun",
      "Kualitas ikan lokal lebih baik"
    ]
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500"; 
    if (progress >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getTrendIcon = (trend) => {
    if (trend.startsWith('+')) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Prediksi Panen & Pertumbuhan</h2>
        <p className="text-gray-600 mt-1">Analisis AI untuk estimasi hasil panen dan strategi optimal</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {growthMetrics.map((metric, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm ${
                      metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend}
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Harvest Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {harvestPredictions.map((prediction, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{prediction.pond}</CardTitle>
                <Badge className={getProgressColor(prediction.progress)}>
                  {prediction.progress}%
                </Badge>
              </div>
              <CardDescription>Usia: {prediction.currentAge} dari {prediction.targetAge} hari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress Pertumbuhan</span>
                  <span>{prediction.progress}%</span>
                </div>
                <Progress value={prediction.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">{prediction.estimatedHarvest}</p>
                  <p className="text-xs text-gray-600">Target Panen</p>
                </div>
                <div className="text-center p-3 bg-green-50/50 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">{prediction.expectedYield}</p>
                  <p className="text-xs text-gray-600">Prediksi Hasil</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Berat/ekor:</span>
                  <span className="font-medium">{prediction.predictedWeight}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimasi Hidup:</span>
                  <span className="font-medium">{prediction.predictedCount} ekor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin Profit:</span>
                  <span className="font-medium text-green-600">{prediction.profitMargin}%</span>
                </div>
              </div>

              <div className="p-3 bg-yellow-50/50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Rekomendasi AI:
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {prediction.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Prediksi Harga Pasar</span>
            </CardTitle>
            <CardDescription>Analisis tren harga dan waktu panen optimal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50/50 rounded-lg">
                <p className="text-sm text-gray-600">Harga Saat Ini</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {marketPredictions.currentPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">per kg</p>
              </div>
              <div className="text-center p-4 bg-green-50/50 rounded-lg">
                <p className="text-sm text-gray-600">Prediksi 1 Bulan</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {marketPredictions.predictedPrice.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+{marketPredictions.priceChange}%</p>
              </div>
            </div>

            <div className="p-3 bg-green-50/50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-800 mb-2">📈 Tren Pasar: Bullish</h4>
              <p className="text-sm text-green-700 mb-2">
                Harga diprediksi naik {marketPredictions.priceChange}% dalam 4 minggu ke depan.
              </p>
              <div className="text-xs text-green-600">
                <p className="font-medium mb-1">Faktor Pendukung:</p>
                <ul className="space-y-1">
                  {marketPredictions.factors.map((factor, i) => (
                    <li key={i}>• {factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fish className="h-5 w-5 text-blue-600" />
              <span>Ringkasan Proyeksi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Total Estimasi Panen:</span>
                  <span className="font-bold text-blue-600">20.1 ton</span>
                </div>
              </div>
              <div className="p-3 bg-green-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Estimasi Pendapatan:</span>
                  <span className="font-bold text-green-600">Rp 351.7 juta</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Proyeksi Profit:</span>
                  <span className="font-bold text-purple-600">Rp 126.6 juta</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-50/50 rounded-lg border-l-4 border-orange-400">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Strategi Panen Optimal
              </h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Panen Kolam B terlebih dahulu (Feb 28)</li>
                <li>• Tunda panen Kolam A hingga harga puncak (Mar 15)</li>
                <li>• Kolam C bisa diperpanjang hingga Apr untuk size premium</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart Placeholder */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle>Grafik Pertumbuhan & Prediksi</CardTitle>
          <CardDescription>Tren pertumbuhan historis dan proyeksi ke depan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50/30 to-teal-50/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">Grafik Pertumbuhan Interaktif</p>
              <p className="text-sm text-gray-500">Akan diintegrasikan dengan library chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrowthPredictions;
