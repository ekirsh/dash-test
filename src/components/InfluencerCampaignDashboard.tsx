import React, { useEffect, useState } from 'react';
import { ComboChart } from "@/components/ComboChart";

const InfluencerCampaignDashboard = () => {
  const [campaignData, setCampaignData] = useState({
    dates: [],
    totalSpent: [],
    totalEngagement: [],
    totalStreams: []
  });

  useEffect(() => {
    // Load CSV data using fetch
    fetch('./Completed_Engagement_Data.csv')
      .then(response => response.text())
      .then(csvText => {
        const rows = csvText.split('\n').slice(1); // Split by new line and skip the header
        const parsedData = rows.map(row => {
          // Use regex to properly split by comma while preserving date format
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

        const dates = parsedData.map(row => row.Date);
        const totalSpent = parsedData.map(row => row.TotalSpent);
        const totalEngagement = parsedData.map(row => row.TotalEngagement);
        const totalStreams = parsedData.map(row => row.TotalStreams);

        setCampaignData({
          dates,
          totalSpent,
          totalEngagement,
          totalStreams
        });
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
      });
  }, []);

  const spendVsEngagementData = campaignData.dates.map((date, index) => ({
    date,
    spend: campaignData.totalSpent[index],
    engagement: campaignData.totalEngagement[index]
  }));

  const spendVsStreamsData = campaignData.dates.map((date, index) => ({
    date,
    spend: campaignData.totalSpent[index],
    streams: campaignData.totalStreams[index]
  }));

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Influencer Campaign Dashboard</h1>

        {/* Spend vs. Engagement Combo Chart */}
        <Card className="mb-8">
          <Title>Spend vs. Engagement</Title>
          <ComboChart
            data={spendVsEngagementData}
            index="date"
            enableBiaxial={true}
            barSeries={{
              categories: ["spend"],
              yAxisLabel: "Total $ Spent (Bars)",
            }}
            lineSeries={{
              categories: ["engagement"],
              showYAxis: true,
              yAxisLabel: "Total Engagement (Line)",
              colors: ["blue"],
              yAxisWidth: 60,
            }}
          />
        </Card>

        {/* Spend vs. Streams Combo Chart */}
        <Card className="mb-8">
          <Title>Spend vs. Streams</Title>
          <ComboChart
            data={spendVsStreamsData}
            index="date"
            enableBiaxial={true}
            barSeries={{
              categories: ["spend"],
              yAxisLabel: "Total $ Spent (Bars)",
            }}
            lineSeries={{
              categories: ["streams"],
              showYAxis: true,
              yAxisLabel: "Total Streams (Line)",
              colors: ["red"],
              yAxisWidth: 60,
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default InfluencerCampaignDashboard;
