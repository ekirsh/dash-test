"use client"

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { ComboChart } from "@/components/ComboChart";
import { LineChart } from "@/components/LineChart";
import { Card } from "@/components/Card";


interface CampaignData {
  dates: string[];
  totalSpent: number[];
  totalEngagement: number[];
  totalStreams: number[];
  dailyStreams: number[];
}


export default function Home() {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    dates: [] as string[],
    totalSpent: [] as number[],
    totalEngagement: [] as number[],
    totalStreams: [] as number[],
    dailyStreams: [] as number[]
  });
  

  useEffect(() => {
    fetch('./Completed_Engagement_Data.csv')
      .then(response => response.text())
      .then(csvText => {
        const rows = csvText.split('\n').slice(1);
        const parsedData = rows.map(row => {
          const regex = /"(.*?)"|([^,]+)/g;
          const matches = row.match(regex);
          if (matches && matches.length === 4) {
            const [Date, TotalStreams, TotalEngagement, TotalSpent] = matches.map(value => value.replace(/"/g, '').trim());
            return {
              Date,
              TotalSpent: parseFloat(TotalSpent) || 0,
              TotalEngagement: parseFloat(TotalEngagement) || 0,
              TotalStreams: parseFloat(TotalStreams) || 0
            };
          } else {
            return null;
          }
        }).filter(row => row !== null);

        const dates = parsedData.map(row => row!.Date);
        const totalSpent = parsedData.map(row => row!.TotalSpent);
        const totalEngagement = parsedData.map(row => row!.TotalEngagement);
        const totalStreams = parsedData.map(row => row!.TotalStreams);

        const dailyStreams = totalStreams.map((value, index) =>
          index === 0 ? 0 : value - totalStreams[index - 1]
        );

        setCampaignData({
          dates,
          totalSpent,
          totalEngagement,
          totalStreams,
          dailyStreams
        });
      })
      .catch(error => console.error('Error loading CSV:', error));
  }, []);

    // Calculate average daily growth and stream effectiveness based on spend
  // Calculate average daily growth and stream effectiveness based on spend
  const calculateStreamEffectiveness = (currentIndex: number): number => {
    const totalDays = currentIndex - 1; // Calculate days up to and including the current day
    
    if (totalDays < 2) return 0; // Not enough data to calculate growth
  
    // Starting from the first day's daily stream count
    const initialStreamCount = campaignData.dailyStreams[0];
  
    // Calculate only the positive growth days and their differences
    const positiveGrowth = campaignData.dailyStreams.slice(1, totalDays).map((value, index) => {
      const difference = value - campaignData.dailyStreams[index];
      return difference > 0 ? difference : 0; // Only include positive differences
    });
  
    // Sum of positive growth differences
    const totalPositiveGrowth = positiveGrowth.reduce((sum, growth) => sum + growth, 0);
    console.log(totalPositiveGrowth);
  
    // Calculate stream effectiveness as expected growth per dollar spent
    const totalSpentSum = campaignData.totalSpent[totalDays - 1] || 1; // Avoid divide by zero
    return parseFloat((totalPositiveGrowth / totalSpentSum).toFixed(2));
  };
  
  

  // Calculate daily effectiveness data for each day
  const dailyEffectivenessData = campaignData.dates.map((date, index) => {
    // Calculate stream effectiveness up to the current day (index)
    const streamEffectiveness = calculateStreamEffectiveness(index);

    const spend = campaignData.totalSpent[index];
    if (spend === 0) return { date, combinedEffectiveness: 0 };

    console.log(streamEffectiveness);
    const engagementEffectiveness = campaignData.totalEngagement[index] / spend;
    const combinedEffectiveness = ((0.7 * engagementEffectiveness + 0.3 * streamEffectiveness) / 100).toFixed(2);

    return { date, combinedEffectiveness };
  });


  const totalSpentSum = campaignData.totalSpent[campaignData.totalSpent.length - 1] || 0;
  const totalEngagementSum = campaignData.totalEngagement[campaignData.totalEngagement.length - 1] || 0;
  const totalStreamsSum = campaignData.totalStreams[campaignData.totalStreams.length - 1] || 0;

  const engagementEffectiveness = totalSpentSum ? (totalEngagementSum / totalSpentSum).toFixed(2) : 0;
  const streamEffectiveness = calculateStreamEffectiveness(campaignData.totalStreams.length - 1)

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denominatorX = Math.sqrt(x.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0));
    const denominatorY = Math.sqrt(y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0));
  
    const denominator = denominatorX * denominatorY;
    return denominator === 0 ? 0 : parseFloat((numerator / denominator).toFixed(4));
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 ml-16 mb-8 tracking-tight">Influencer Campaign Dashboard</h1>
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-10">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center space-x-4">
            <Image src="/coverart.jpeg" alt="Cover Art" width={80} height={80} className="rounded-lg shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jailbreak</h1>
              <p className="text-gray-500 text-sm">Waylon Wyatt</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">{`Last Updated: ${campaignData.dates[campaignData.dates.length - 1] || new Date().toLocaleDateString()}`}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Total Spent</h3>
            <p className="text-3xl font-bold">${totalSpentSum.toLocaleString()}</p>
          </Card>
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Total Engagement</h3>
            <p className="text-3xl font-bold">{totalEngagementSum.toLocaleString()}</p>
          </Card>
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Total Streams</h3>
            <p className="text-3xl font-bold">{totalStreamsSum.toLocaleString()}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Engagement Effectiveness</h3>
            <p className="text-3xl font-bold">{engagementEffectiveness} engagements per $ spent</p>
          </Card>
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Stream Gain Effectiveness</h3>
            <p className="text-3xl font-bold">{streamEffectiveness} streams per $ spent</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          <Card className="mb-8">
            <h3>Spend vs. Engagement</h3>
            <ComboChart
              data={campaignData.dates.map((date, index) => ({
                date,
                spend: campaignData.totalSpent[index],
                engagement: campaignData.totalEngagement[index]
              }))}
              index="date"
              enableBiaxial={true}
              barSeries={{
                categories: ["engagement"],
                yAxisLabel: "Total Engagement (Bars)",
              }}
              lineSeries={{
                categories: ["spend"],
                showYAxis: true,
                yAxisLabel: "Total $ Spent (Line)",
                colors: ["amber"],
                yAxisWidth: 60,
                valueFormatter: (v) =>
              `$${Intl.NumberFormat("us").format(v).toString()}`,
              }}
            />
          </Card>

          <Card className="mb-8">
            <h3>Spend vs. Total Streams</h3>
            <ComboChart
              data={campaignData.dates.map((date, index) => ({
                date,
                spend: campaignData.totalSpent[index],
                streams: campaignData.totalStreams[index]
              }))}
              index="date"
              enableBiaxial={true}
              barSeries={{
                categories: ["streams"],
                yAxisLabel: "Total Streams (Bars)",
              }}
              lineSeries={{
                categories: ["spend"],
                showYAxis: true,
                yAxisLabel: "Total Spend (Line)",
                colors: ["amber"],
                yAxisWidth: 60,
                valueFormatter: (v) =>
                  `$${Intl.NumberFormat("us").format(v).toString()}`,
              }}
            />
          </Card>
        </div>

        <Card className="mb-8">
            <h3>Spend vs. Daily Streams</h3>
            <ComboChart
              data={campaignData.dates.map((date, index) => ({
                date,
                spend: campaignData.totalSpent[index],
                streams: campaignData.dailyStreams[index]
              }))}
              index="date"
              enableBiaxial={true}
              barSeries={{
                categories: ["streams"],
                yAxisLabel: "Daily Streams (Bars)",
              }}
              lineSeries={{
                categories: ["spend"],
                showYAxis: true,
                yAxisLabel: "Total Spend (Line)",
                colors: ["amber"],
                yAxisWidth: 60,
                valueFormatter: (v) =>
                  `$${Intl.NumberFormat("us").format(v).toString()}`,
              }}
            />
          </Card>

        <Card className="mb-8">
          <h3>Effectiveness Over Time</h3>
          <LineChart
            className="h-80"
            data={dailyEffectivenessData}
            index="date"
            categories={["combinedEffectiveness"]}
            xAxisLabel="Date"
            yAxisLabel="Combined Effectiveness"
          />
        </Card>
        <Card className="mb-8">
        <h1 className="mb-4">Correlation Analysis</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Total $ Spent vs. Total Engagement</h3>
            <p className="text-3xl font-bold ">{calculateCorrelation(campaignData.totalSpent, campaignData.totalEngagement)}</p>
          </Card>
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Total $ Spent vs. Total Streams</h3>
            <p className="text-3xl font-bold">{calculateCorrelation(campaignData.totalSpent, campaignData.totalStreams)}</p>
          </Card>
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Total Engagement vs. Total Streams</h3>
            <p className="text-3xl font-bold ">{calculateCorrelation(campaignData.totalEngagement, campaignData.totalStreams)}</p>
          </Card>
          <Card className="p-6 rounded-xl shadow-sm">
            <h3>Total $ Spent vs. Daily Streams</h3>
            <p className="text-3xl font-bold ">{calculateCorrelation(campaignData.totalSpent, campaignData.dailyStreams)}</p>
          </Card>
        </div>
        </Card>
      </div>
    </div>
  );
}
