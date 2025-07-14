
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

  // Calculate real growth metrics from actual data
  const calculateGrowthMetrics = () => {
    if (ponds.length === 0) return {
      avgGrowthRate: 0,
      totalBiomass: 0,
      avgSurvivalRate: 0,
      avgFCR: 0
    };

    const totalFish = ponds.reduce((sum, pond) => sum + pond.fish_count, 0);
    const avgAge = ponds.reduce((sum, pond) => sum + pond.fish_age_days, 0) / ponds.length;
    const totalFeed = schedules.reduce((sum, schedule) => sum + schedule.feed_amount_kg, 0);
    const totalBiomass = ponds.reduce((sum, pond) => {
      const avgWeight = Math.max(50 + (pond.fish_age_days * 20), 50);
      return sum + (pond.fish_count * avgWeight / 1000);
    }, 0);

    const healthyPonds = healthRecords.filter(record => record.health_status === 'healthy').length;
    const survivalRate = healthRecords.length > 0 ? (healthyPonds / healthRecords.length) * 100 : 85;

    return {
      avgGrowthRate: avgAge > 0 ? avgAge * 0.8 : 0,
      totalBiomass: totalBiomass,
      avgSurvivalRate: Math.min(survivalRate, 100),
      avgFCR: totalFeed > 0 && totalBiomass > 0 ? totalFeed / totalBiomass : 1.2
    };
  };

  useEffect(() => {
    const calculatePredictions = () => {
      return ponds.map(pond => {
        const currentAge = pond.fish_age_days || 0;
        const targetAge = 90;
        const progress = Math.min((currentAge / targetAge) * 100, 100);
        
        const daysRemaining = Math.max(targetAge - currentAge, 0);
        const harvestDate = new Date();
        harvestDate.setDate(harvestDate.getDate() + daysRemaining);
        
        const pondSchedules = schedules.filter(s => s.pond_id === pond.id);
        const totalFeedGiven = pondSchedules.reduce((sum, s) => sum + s.feed_amount_kg, 0);
        const feedingFactor = totalFeedGiven > 0 ? totalFeedGiven * 0.05 : 0;
        const estimatedWeight = Math.max(50 + (currentAge * 25) + feedingFactor, 50);
        
        const recentHealth = healthRecords
          .filter(r => r.pond_id === pond.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        let survivalRate = 0.85;
        if (recentHealth?.health_status === 'healthy') survivalRate = 0.95;
        else if (recentHealth?.health_status === 'sick') survivalRate = 0.70;
        else if (recentHealth?.health_status === 'critical') survivalRate = 0.50;
        
        const expectedCount = Math.floor(pond.fish_count * survivalRate);
        const expectedYield = (expectedCount * estimatedWeight) / 1000;
        
        let profitMargin = 25;
        if (recentHealth?.health_status === 'healthy') profitMargin += 15;
        else if (recentHealth?.health_status === 'sick') profitMargin -= 10;
        else if (recentHealth?.health_status === 'critical') profitMargin -= 20;
        
        const feedingEfficiency = pondSchedules.length / Math.max(currentAge / 7, 1);
        if (feedingEfficiency > 1) profitMargin += 5;
        else if (feedingEfficiency < 0.5) profitMargin -= 5;
        
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
          recommendations: generateRecommendations(pond, currentAge, recentHealth, pondSchedules)
        };
      });
    };

    setPredictions(calculatePredictions());
  }, [ponds, schedules, healthRecords]);

  const generateRecommendations = (pond, age, healthRecord, pondSchedules) => {
    const recommendations = [];
    
    if (age < 30) {
      recommendations.push("Tingkatkan frekuensi pakan untuk pertumbuhan optimal");
      if (pondSchedules.length < 14) {
        recommendations.push("Jadwal pakan masih kurang, tambahkan lebih banyak");
      }
    } else if (age > 80) {
      recommendations.push("Siap untuk panen dalam waktu dekat");
      recommendations.push("Kurangi pakan bertahap untuk persiapan panen");
    } else {
      recommendations.push("Pertahankan pola pakan saat ini");
    }
    
    if (healthRecord?.health_status === 'sick') {
      recommendations.push("Monitor kesehatan lebih ketat - ada riwayat sakit");
      recommendations.push("Pertimbangkan treatment khusus sebelum panen");
    } else if (healthRecord?.health_status === 'critical') {
      recommendations.push("Perhatian khusus diperlukan - status kritis");
      recommendations.push("Konsultasi dengan ahli perikanan");
    } else if (!healthRecord) {
      recommendations.push("Lakukan pemeriksaan kesehatan rutin");
    } else {
      recommendations.push("Kondisi kesehatan baik, lanjutkan perawatan");
    }
    
    const density = pond.fish_count / pond.size_m2;
    if (density > 20) {
      recommendations.push("Kepadatan ikan tinggi, pertimbangkan panen bertahap");
    }
    
    return recommendations;
  };

  const handleAIPrediction = async () => {
    if (ponds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Tidak ada data kolam untuk dianalisis"
      });
      return;
    }

    const contextData = ponds.map(pond => {
      const pondSchedules = schedules.filter(s => s.pond_id === pond.id);
      const pondHealth = healthRecords.filter(r => r.pond_id === pond.id);
      
      return {
        name: pond.name,
        size: pond.size_m2,
        depth: pond.depth_m,
        fishCount: pond.fish_count,
        fishAge: pond.fish_age_days,
        waterTemp: pond.water_temperature,
        phLevel: pond.ph_level,
        status: pond.status,
        totalFeedings: pondSchedules.length,
        totalFeed: pondSchedules.reduce((sum, s) => sum + s.feed_amount_kg, 0),
        recentHealth: pondHealth[0]?.health_status || 'unknown',
        healthRecordsCount: pondHealth.length
      };
    });

    const fullPrompt = `
Data Kolam Real-time:
${JSON.stringify(contextData, null, 2)}

Informasi Tambahan:
${growthPrompt || 'Berikan analisis umum berdasarkan data kolam yang ada'}

Berdasarkan data real-time di atas, berikan analisis prediksi pertumbuhan dan rekomendasi panen yang spesifik. Sertakan:
1. Tingkat pertumbuhan berdasarkan umur dan pakan
2. Rekomendasi waktu panen optimal
3. Strategi pakan yang disesuaikan
4. Prediksi hasil panen
5. Timing pasar yang tepat
6. Estimasi keuntungan berdasarkan kondisi saat ini
    `;

    try {
      const result = await predictGrowth(fullPrompt);
      setAiPrediction(result);
      toast({
        title: "Prediksi Selesai",
        description: "AI telah menganalisis data real-time dan memberikan prediksi"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mendapatkan prediksi dari AI"
      });
    }
  };

  const growthMetrics = calculateGrowthMetrics();

  const calculateMarketPredictions = () => {
    const avgAge = ponds.length > 0 ? ponds.reduce((sum, pond) => sum + pond.fish_age_days, 0) / ponds.length : 0;
    const healthyPonds = healthRecords.filter(record => record.health_status === 'healthy').length;
    const totalPonds = ponds.length;
    const healthRatio = totalPonds > 0 ? healthyPonds / totalPonds : 0;
    
    let basePrice = 16000;
    let priceChange = 0;
    
    if (avgAge > 70) {
      priceChange += 5;
      basePrice += 500;
    }
    if (healthRatio > 0.8) {
      priceChange += 3;
      basePrice += 300;
    }
    
    return {
      currentPrice: basePrice,
      predictedPrice: basePrice + (basePrice * priceChange / 100),
      priceChange: priceChange,
      marketTrend: priceChange > 0 ? "bullish" : "bearish",
      factors: [
        healthRatio > 0.8 ? "Kualitas ikan sehat mendukung harga" : "Kesehatan ikan perlu diperbaiki",
        avgAge > 70 ? "Ikan mendekati masa panen optimal" : "Ikan masih dalam fase pertumbuhan",
        totalPonds > 0 ? `${totalPonds} kolam aktif mendukung produksi` : "Belum ada kolam aktif"
      ]
    };
  };

  const marketPredictions = calculateMarketPredictions();

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500"; 
    if (progress >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Prediksi Panen & Pertumbuhan</h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Analisis AI berdasarkan data real-time untuk estimasi hasil panen dan strategi optimal</p>
      </div>

      {/* AI Prediction Section */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <span>Konsultasi AI untuk Prediksi Pertumbuhan</span>
          </CardTitle>
          <CardDescription>
            Dapatkan analisis mendalam berdasarkan data real-time kolam Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="growth-prompt">Informasi Tambahan (Opsional)</Label>
            <Textarea
              id="growth-prompt"
              value={growthPrompt}
              onChange={(e) => setGrowthPrompt(e.target.value)}
              placeholder="Contoh: Target panen dalam 2 bulan, harga pakan naik, kondisi cuaca tidak menentu, rencana ekspansi..."
              rows={3}
            />
          </div>
          <Button 
            onClick={handleAIPrediction} 
            disabled={aiLoading || ponds.length === 0}
            className="w-full"
          >
            {aiLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Menganalisis Data Real-time...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisis Data Real-time dengan AI
              </>
            )}
          </Button>
          {ponds.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">Tambahkan kolam terlebih dahulu untuk menggunakan fitur AI</p>
          )}
        </CardContent>
      </Card>

      {/* AI Prediction Results */}
      {aiPrediction && (
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <span>Hasil Analisis AI (Berdasarkan Data Real-time)</span>
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
                  <p className="text-purple-700">{aiPrediction.expectedYield}</p>
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

      {/* Key Metrics - Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Rata-rata Pertumbuhan</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{growthMetrics.avgGrowthRate.toFixed(1)}g/hari</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-green-600">Real-time</span>
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
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Biomassa</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{growthMetrics.totalBiomass.toFixed(1)} ton</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Fish className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <span className="text-xs sm:text-sm text-blue-600">Aktual</span>
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
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Survival Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{growthMetrics.avgSurvivalRate.toFixed(0)}%</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-green-600">Berdasarkan kesehatan</span>
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
                <p className="text-xs sm:text-sm text-muted-foreground truncate">FCR Rata-rata</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{growthMetrics.avgFCR.toFixed(1)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                  <span className="text-xs sm:text-sm text-orange-600">Dari data pakan</span>
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
            <Fish className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-muted-foreground mb-2">Belum Ada Data Kolam</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">Tambahkan kolam untuk melihat prediksi panen real-time</p>
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
                    <p className="text-xs text-muted-foreground">Target Panen</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-green-50/50 rounded-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm font-medium truncate">{prediction.expectedYield} ton</p>
                    <p className="text-xs text-muted-foreground">Prediksi Hasil</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Berat/ekor:</span>
                    <span className="font-medium">{prediction.predictedWeight.toFixed(0)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimasi Hidup:</span>
                    <span className="font-medium">{prediction.predictedCount} ekor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin Profit:</span>
                    <span className="font-medium text-green-600">{prediction.profitMargin}%</span>
                  </div>
                </div>

                <div className="p-2 sm:p-3 bg-yellow-50/50 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-medium text-yellow-800 mb-2 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Rekomendasi Berdasarkan Data:
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
            <CardDescription className="text-xs sm:text-sm">Analisis berdasarkan kondisi kolam real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50/50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Harga Saat Ini</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  Rp {marketPredictions.currentPrice.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground/70">per kg</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50/50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Prediksi 1 Bulan</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  Rp {marketPredictions.predictedPrice.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  {marketPredictions.priceChange > 0 ? '+' : ''}{marketPredictions.priceChange.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-lg border-l-4 ${
              marketPredictions.marketTrend === 'bullish' 
                ? 'bg-green-50/50 border-green-400' 
                : 'bg-red-50/50 border-red-400'
            }`}>
              <h4 className={`font-medium mb-2 text-sm ${
                marketPredictions.marketTrend === 'bullish' ? 'text-green-800' : 'text-red-800'
              }`}>
                📈 Tren Pasar: {marketPredictions.marketTrend === 'bullish' ? 'Bullish' : 'Bearish'}
              </h4>
              <div className={`text-xs ${
                marketPredictions.marketTrend === 'bullish' ? 'text-green-600' : 'text-red-600'
              }`}>
                <p className="font-medium mb-1">Faktor Berdasarkan Data Real-time:</p>
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
              <span>Ringkasan Proyeksi Real-time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Total Estimasi Panen:</span>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">{growthMetrics.totalBiomass.toFixed(1)} ton</span>
                </div>
              </div>
              <div className="p-3 bg-green-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Estimasi Pendapatan:</span>
                  <span className="font-bold text-green-600 text-sm sm:text-base">
                    Rp {(growthMetrics.totalBiomass * marketPredictions.predictedPrice).toFixed(0)} ribu
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Proyeksi Profit:</span>
                  <span className="font-bold text-purple-600 text-sm sm:text-base">
                    Rp {(growthMetrics.totalBiomass * marketPredictions.predictedPrice * 0.35).toFixed(0)} ribu
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-50/50 rounded-lg border-l-4 border-orange-400">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Strategi Berdasarkan Data Real-time
              </h4>
              <ul className="text-xs sm:text-sm text-orange-700 space-y-1">
                <li className="break-words">• Panen kolam dengan progress {'>'}80% terlebih dahulu</li>
                <li className="break-words">• Monitor kesehatan berdasarkan riwayat aktual</li>
                <li className="break-words">• Sesuaikan strategi pakan berdasarkan FCR real-time</li>
                <li className="break-words">• Manfaatkan kondisi terbaik untuk maksimalkan profit</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GrowthPredictions;
