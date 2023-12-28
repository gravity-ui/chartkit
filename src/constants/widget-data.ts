export const WidgetType = {
    Area: 'area',
    BarX: 'bar-x',
    BarY: 'bar-y',
    Line: 'line',
    Pie: 'pie',
    Scatter: 'scatter',
} as const;

export enum DashStyle {
    Dash = 'Dash',
    DashDot = 'DashDot',
    Dot = 'Dot',
    LongDash = 'LongDash',
    LongDashDot = 'LongDashDot',
    LongDashDotDot = 'LongDashDotDot',
    ShortDash = 'ShortDash',
    ShortDashDot = 'ShortDashDot',
    ShortDashDotDot = 'ShortDashDotDot',
    ShortDot = 'ShortDot',
    Solid = 'Solid',
}

export enum LineCap {
    Butt = 'butt',
    Round = 'round',
    Square = 'square',
    None = 'none',
}