import * as React from "react"
import { cn } from "@/lib/utils"

// Chart data types for compatibility
export interface ChartData {
  name: string
  value: number
  [key: string]: any
}

// Base chart props interface
interface BaseChartProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

// Extended chart props interface for all chart components
interface ChartComponentProps extends BaseChartProps {
  data?: ChartData[]
  dataKey?: string
  nameKey?: string
  onFilter?: (value: string | number) => void
  [key: string]: any
}

// Base Chart component
const Chart = React.forwardRef<HTMLDivElement, BaseChartProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full h-full", className)}
      {...props}
    >
      {children}
    </div>
  )
)
Chart.displayName = "Chart"

// Bar Chart component
const BarChart = React.forwardRef<HTMLDivElement, ChartComponentProps>(
  ({ className, children, data, dataKey, nameKey, onFilter, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full h-full bg-gray-100 rounded p-4", className)}
      {...props}
    >
      <div className="text-center text-gray-500">Bar Chart Placeholder</div>
      {data && (
        <div className="text-xs text-gray-400 mt-2">
          Data: {data.length} items
        </div>
      )}
      {children}
    </div>
  )
)
BarChart.displayName = "BarChart"

// Pie Chart component
const PieChart = React.forwardRef<HTMLDivElement, ChartComponentProps>(
  ({ className, children, data, dataKey, nameKey, onFilter, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full h-full bg-gray-100 rounded p-4", className)}
      {...props}
    >
      <div className="text-center text-gray-500">Pie Chart Placeholder</div>
      {data && (
        <div className="text-xs text-gray-400 mt-2">
          Data: {data.length} items
        </div>
      )}
      {children}
    </div>
  )
)
PieChart.displayName = "PieChart"

// Area Chart component
const AreaChart = React.forwardRef<HTMLDivElement, ChartComponentProps>(
  ({ className, children, data, dataKey, nameKey, onFilter, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full h-full bg-gray-100 rounded p-4", className)}
      {...props}
    >
      <div className="text-center text-gray-500">Area Chart Placeholder</div>
      {data && (
        <div className="text-xs text-gray-400 mt-2">
          Data: {data.length} items
        </div>
      )}
      {children}
    </div>
  )
)
AreaChart.displayName = "AreaChart"

// Horizontal Bar Chart component
const HorizontalBarChart = React.forwardRef<HTMLDivElement, ChartComponentProps>(
  ({ className, children, data, dataKey, nameKey, onFilter, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full h-full bg-gray-100 rounded p-4", className)}
      {...props}
    >
      <div className="text-center text-gray-500">Horizontal Bar Chart Placeholder</div>
      {data && (
        <div className="text-xs text-gray-400 mt-2">
          Data: {data.length} items
        </div>
      )}
      {children}
    </div>
  )
)
HorizontalBarChart.displayName = "HorizontalBarChart"

export { Chart, BarChart, PieChart, AreaChart, HorizontalBarChart }
