import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Calendar, 
  Fish, 
  Target,
  BarChart3,
  Zap,
  AlertCircle,
  Bot,
  Sparkles
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeFeedingSchedules, useRealtimeHealthRecords } from "@/hooks/useRealtimeData";
import { useToast } from "@/hooks/use-toast";
import { useGeminiAI } from "@/hooks/useGeminiAI";

const GrowthPredictions = () => {
  const { ponds } = usePonds();
  const { schedules } = useRealtimeFeedingSchedules();
  const { healthRecords } = useRealtimeHealthRecords();
  const { predictGrowth, isLoading: aiLoading } = useGeminiAI();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState([]);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [growthPrompt, setGrowthPrompt] = useState("");

  useEffect(() => {
    // Calculate predictions based on real data
    const calculatePredictions = () => {
      return ponds.map(pond => {
        const currentAge = pond.fish_age_days || 0;
        const targetAge = 90; // Standard harvest age for catfish
        const progress = Math.min((currentAge / targetAge) * 100, 100);
        
        // Calculate estimated harvest date
        const daysRemaining = Math.max(targetAge - currentAge, 0);
        const harvestDate = new Date();
        harvestDate.setDate(harvestDate.getDate() + daysRemaining);
        
        // Estimate weight based on age and feeding
        const pondSchedules = schedules.filter(s => s.pond_id === pond.id);
        const totalFeedGiven = pondSchedules.reduce((sum, s) => sum + s.feed_amount_kg, 0);
        const estimatedWeight = Math.max(50 + (currentAge * 25) + (totalFeedGiven * 0.1), 50);
        
        // Calculate expected yield
        const survivalRate = 0.85; // Assume 85% survival rate
        const expectedCount = Math.floor(pond.fish_count * survivalRate);
        const expectedYield = (expectedCount * estimatedWeight) / 1000; // Convert to tons
        
        // Calculate profit margin based on health status
        const recentHealth = healthRecords
          .filter(r => r.pond_id === pond.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        let profitMargin = 30; // Base profit margin
        if (recentHealth?.health_status === 'healthy') profitMargin += 10;
        else if (recentHealth?.health_status === 'sick') profitMargin -= 5;
        else if (recentHealth?.health_status === 'critical') profitMargin -= 15;
        
        return {
          pond: pond.name,
          currentAge,
          targetAge,
          progress,
          estimatedHarvest: harvestDate.toISOString().split('T')[0],
          predictedWeight: estimatedWeight,
          predictedCount: expectedCount,
          expectedYield: expectedYield.toFixed(3),
          profitMargin: Math.max(profitMargin, 5),
          recommendations: generateRecommendations(pond, currentAge, recentHealth)
        };
      });
    };

    setPredictions(calculatePredictions());
  }, [ponds, schedules, healthRecords]);

  const generateRecommendations = (pond, age, healthRecord) => {
    const recommendations = [];
    
    if (age < 30) {
      recommendations.push("Tingkatkan frekuensi pakan untuk pertumbuhan optimal");
    } else if (age > 80) {
      recommendations.push("Siap untuk panen dalam waktu dekat");
      recommendations.push("Kurangi pakan bertahap untuk persiapan panen");
    } else {
      recommendations.push("Pertahankan pola pakan saat ini");
    }
    
    if (healthRecord?.health_status === 'sick') {
      recommendations.push("Monitor kesehatan lebih ketat");
    } else if (!healthRecord) {
      recommendations.push("Lakukan pemeriksaan kesehatan rutin");
    }
    
    return recommendations;
  };

  const handleAIPrediction = async () => {
    if (!growthPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon masukkan data kolam untuk prediksi"
      });
      return;
    }

    // Prepare context with pond data
    const contextData = ponds.map(pond => ({
      name: pond.name,
      size: pond.size_m2,
      fishCount: pond.fish_count,
      fishAge: pond.fish_age_days,
      waterTemp: pond.water_temperature,
      phLevel: pond.ph_level
    }));

    const fullPrompt = `
Data Kolam:
${JSON.stringify(contextData, null, 2)}

Informasi Tambahan:
${growthPrompt}

Berikan prediksi pertumbuhan dan rekomendasi panen berdasarkan data di atas.
    `;

    try {
      const result = await predictGrowth(fullPrompt);
      setAiPrediction(result);
      toast({
        title: "Prediksi Selesai",
        description: "AI telah menganalisis data dan memberikan prediksi pertumbuhan"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mendapatkan prediksi dari AI"
      });
    }
  };

  const growthMetrics = {
    avgGrowthRate: predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + (p.currentAge * 0.5), 0) / predictions.length 
      : 0,
    totalBiomass: predictions.reduce((sum, p) => sum + parseFloat(p.expectedYield), 0),
    avgSurvivalRate: 85, // This would be calculated from actual data
    avgFCR: 1.2 // This would be calculated from feeding data
  };

  const marketPredictions = {
    currentPrice: 16000,
    predictedPrice: 17500,
    priceChange: 9.4,
    marketTrend: "bullish",
    factors: [
      "Permintaan tinggi menjelang musim panen",
      "Kualitas ikan lokal lebih baik",
      "Pasokan dari daerah lain menurun"
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
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Prediksi Panen & Pertumbuhan</h2>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Analisis AI untuk estimasi hasil panen dan strategi optimal</p>
      </div>

      {/* AI Prediction Section */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <span>Konsultasi AI untuk Prediksi Pertumbuhan</span>
          </CardTitle>
          <CardDescription>
            Dapatkan analisis mendalam dan rekomendasi dari AI berdasarkan data kolam Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="growth-prompt">Informasi Tambahan (Opsional)</Label>
            <Textarea
              id="growth-prompt"
              value={growthPrompt}
              onChange={(e) => setGrowthPrompt(e.target.value)}
              placeholder="Contoh: Target panen dalam 2 bulan, harga pakan naik, kondisi cuaca tidak menentu..."
              rows={3}
            />
          </div>
          <Button 
            onClick={handleAIPrediction} 
            disabled={aiLoading}
            className="w-full"
          >
            {aiLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Menganalisis...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Dapatkan Prediksi AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Prediction Results */}
      {aiPrediction && (
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <span>Hasil Prediksi AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiPrediction.growthRate && (
                <div className="p-4 bg-blue-50/50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📈 Tingkat Pertumbuhan:</h4>
                  <p className="text-blue-700 capitalize font-medium">{aiPrediction.growthRate}</p>
                </div>
              )}
              
              {aiPrediction.harvestRecommendation && (
                <div className="p-4 bg-green-50/50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🎯 Rekomendasi Panen:</h4>
                  <p className="text-green-700">{aiPrediction.harvestRecommendation}</p>
                </div>
              )}

              {aiPrediction.feedingStrategy && (
                <div className="p-4 bg-orange-50/50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">🍽️ Strategi Pakan:</h4>
                  <p className="text-orange-700">{aiPrediction.feedingStrategy}</p>
                </div>
              )}

              {aiPrediction.expectedYield && (
                <div className="p-4 bg-purple-50/50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">⚖️ Prediksi Hasil:</h4>
                  <p className="text-purple-700">{aiPrediction.expectedYield}</p>0
                </div>
              )}

              {aiPrediction.marketTiming && (
                <div className="p-4 bg-teal-50/50 rounded-lg">
                  <h4 className="font-semibold text-teal-800 mb-2">📊 Timing Pasar:</h4>
                  <p className="text-teal-700">{aiPrediction.marketTiming}</p>
                </div>
              )}

              {aiPrediction.profitEstimate && (
                <div className="p-4 bg-yellow-50/50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">💰 Estimasi Profit:</h4>
                  <p className="text-yellow-700">{aiPrediction.profitEstimate}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Rata-rata Pertumbuhan</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{growthMetrics.avgGrowthRate.toFixed(1)}g/hari</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon('+2.3%')}
                  <span className="text-xs sm:text-sm text-green-600">+2.3%</span>
                </div>
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Total Biomassa</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{growthMetrics.totalBiomass.toFixed(1)} ton</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon('+5.7%')}
                  <span className="text-xs sm:text-sm text-green-600">+5.7%</span>
                </div>
              </div>
              <Fish className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Survival Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{growthMetrics.avgSurvivalRate}%</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon('+1.2%')}
                  <span className="text-xs sm:text-sm text-green-600">+1.2%</span>
                </div>
              </div>
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">FCR Rata-rata</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{growthMetrics.avgFCR}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 rotate-180" />
                  <span className="text-xs sm:text-sm text-green-600">-0.1</span>
                </div>
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Harvest Predictions */}
      {predictions.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <Fish className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">Belum Ada Data Kolam</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Tambahkan kolam untuk melihat prediksi panen</p>
            <Button className="text-sm sm:text-base">Tambah Kolam</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {predictions.map((prediction, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-blue-100/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg truncate">{prediction.pond}</CardTitle>
                  <Badge className={getProgressColor(prediction.progress)}>
                    {prediction.progress.toFixed(0)}%
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm">Usia: {prediction.currentAge} dari {prediction.targetAge} hari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span>Progress Pertumbuhan</span>
                    <span>{prediction.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={prediction.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-blue-50/50 rounded-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm font-medium truncate">{prediction.estimatedHarvest}</p>
                    <p className="text-xs text-gray-600">Target Panen</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-green-50/50 rounded-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm font-medium truncate">{prediction.expectedYield} ton</p>
                    <p className="text-xs text-gray-600">Prediksi Hasil</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Berat/ekor:</span>
                    <span className="font-medium">{prediction.predictedWeight.toFixed(0)}g</span>
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

                <div className="p-2 sm:p-3 bg-yellow-50/50 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-medium text-yellow-800 mb-2 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Rekomendasi AI:
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {prediction.recommendations.map((rec, i) => (
                      <li key={i} className="break-words">• {rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span>Prediksi Harga Pasar</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Analisis tren harga dan waktu panen optimal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Harga Saat Ini</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  Rp {marketPredictions.currentPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">per kg</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50/50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Prediksi 1 Bulan</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  Rp {marketPredictions.predictedPrice.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+{marketPredictions.priceChange}%</p>
              </div>
            </div>

            <div className="p-3 bg-green-50/50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-800 mb-2 text-sm">📈 Tren Pasar: Bullish</h4>
              <p className="text-xs sm:text-sm text-green-700 mb-2">
                Harga diprediksi naik {marketPredictions.priceChange}% dalam 4 minggu ke depan.
              </p>
              <div className="text-xs text-green-600">
                <p className="font-medium mb-1">Faktor Pendukung:</p>
                <ul className="space-y-1">
                  {marketPredictions.factors.map((factor, i) => (
                    <li key={i} className="break-words">• {factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Fish className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>Ringkasan Proyeksi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-700">Total Estimasi Panen:</span>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">{growthMetrics.totalBiomass.toFixed(1)} ton</span>
                </div>
              </div>
              <div className="p-3 bg-green-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-700">Estimasi Pendapatan:</span>
                  <span className="font-bold text-green-600 text-sm sm:text-base">
                    Rp {(growthMetrics.totalBiomass * marketPredictions.predictedPrice / 1000).toFixed(1)} juta
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-700">Proyeksi Profit:</span>
                  <span className="font-bold text-purple-600 text-sm sm:text-base">
                    Rp {(growthMetrics.totalBiomass * marketPredictions.predictedPrice * 0.35 / 1000).toFixed(1)} juta
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-50/50 rounded-lg border-l-4 border-orange-400">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Strategi Panen Optimal
              </h4>
              <ul className="text-xs sm:text-sm text-orange-700 space-y-1">
                <li className="break-words">• Panen kolam dengan progress {'>'}80% terlebih dahulu</li>
                <li className="break-words">• Manfaatkan tren harga naik untuk maksimalkan profit</li>
                <li className="break-words">• Monitor kesehatan ikan menjelang panen</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GrowthPredictions;
