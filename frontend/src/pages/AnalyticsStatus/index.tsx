import React, { useCallback, useState, useEffect } from "react";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip ,Legend, ResponsiveContainer} from 'recharts';
import { getStatusAnalytics } from "../../utils/api";
import { useQuery } from '@tanstack/react-query';

const barData = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];
  

export function AnalyticsStatus() {
    const { data } = useQuery({
        queryKey: ['statusAnalytics'],
        queryFn: getStatusAnalytics,
      });
    const [bData, setBData] = useState([]);
      useEffect(() => {
        console.log("#########",data);
        if(data)
        {
            const rawData = data[0];

            // Transforming the object into the desired format
            const transformedData = Object.keys(rawData).map(key => ({ name: key.slice(0, -4), value: rawData[key] }));

            console.log(transformedData);
            setBData(transformedData);
        }
  
      }, [data])
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF'];

    return (
        <ResponsiveContainer width="100%" height={700}>
            <BarChart
                width={1500}
                height={700}
                data={bData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 20
                }}
                >
                <CartesianGrid strokeDasharray="3 3"  />
                <XAxis dataKey="name" angle={0}/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8"  />
            </BarChart>
            </ResponsiveContainer>
    );
}
