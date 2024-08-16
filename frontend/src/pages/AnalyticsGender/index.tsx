import React, { useCallback, useState ,useEffect} from "react";

import { PieChart, Pie, Sector, ResponsiveContainer, Cell ,Legend} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getGenderAnalytics } from "../../utils/api";
const piedata = [
    { name: 'Male', value: 400, color: '#8884d8' },
    { name: 'Female', value: 300, color: '#82ca9d' },
    { name: 'Other', value: 300, color: '#ffc658' },
];

const renderActiveShape = (props:any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
};


export function AnalyticsGender() {
        const [activeIndex, setActiveIndex] = useState(0);
    const onPieEnter = useCallback(
        (_, index) => {
        setActiveIndex(index);
        },
        [setActiveIndex]
    );
    const { data } = useQuery({
        queryKey: ['genderAnalytics'],
        queryFn: getGenderAnalytics,
      });
      const [pData, setPData] = useState([]);
    useEffect(() => {
        console.log("#########",data);
        if(data)
            {
                const updatedData =[
                    { name: 'Male', value: data[0].Male, color: '#8884d8' },
                    { name: 'Female', value: data[0].Female, color: '#82ca9d' },
                    { name: 'Other', value: data[0].Other, color: '#ffc658' },
            
                  ];
                  console.log( updatedData);
                  setPData(updatedData);
            }

    }, [data])
    
    return (

<PieChart width={400} height={400}>
                <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                    data={pData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    label
                    onMouseEnter={onPieEnter}
                >
                    {piedata.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Legend />
            </PieChart>

           
        
    );
}
