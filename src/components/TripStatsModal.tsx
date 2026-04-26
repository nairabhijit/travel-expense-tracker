import React, { useState, useMemo } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonSegment, IonSegmentButton, IonLabel, IonItem, IonSelect, IonSelectOption,
  IonList, IonGrid, IonRow, IonCol, IonText, IonCard
} from '@ionic/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Trip, Expense } from '../types';
import { CATEGORIES, SOURCES, CURRENCIES } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatAmount } from '../utils/format';

interface TripStatsModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  trip: Trip;
  expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

const TripStatsModal: React.FC<TripStatsModalProps> = ({ isOpen, onDidDismiss, trip, expenses }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'category' | 'date'>('category');
  
  // Table Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Chart Data calculations using useMemo
  const chartData = useMemo(() => {
    if (chartType === 'category') {
      const grouped = expenses.reduce((acc, exp) => {
        const catName = CATEGORIES.find(c => c.id === exp.categoryId)?.name || exp.categoryId;
        acc[catName] = (acc[catName] || 0) + (exp.baseCurrencyAmount || exp.amount);
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort descending
    } else {
      // Day-wise
      const grouped = expenses.reduce((acc, exp) => {
        const dateStr = new Date(exp.date).toLocaleDateString();
        acc[dateStr] = (acc[dateStr] || 0) + (exp.baseCurrencyAmount || exp.amount);
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sort chronological
    }
  }, [expenses, chartType]);

  // Table Data calculations
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchCat = filterCategory === 'all' || exp.categoryId === filterCategory;
      const matchSrc = filterSource === 'all' || exp.sourceId === filterSource;
      return matchCat && matchSrc;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCategory, filterSource]);

  const currencySymbol = CURRENCIES.find(c => c.code === trip.localCurrency)?.symbol || trip.localCurrency;
  const currencyIcon = CURRENCIES.find(c => c.code === trip.localCurrency)?.icon;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Trip Stats</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDidDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonSegment mode="ios" value={viewMode} onIonChange={e => setViewMode(e.detail.value as any)} className="ion-margin-bottom" style={{ minHeight: '28px', height: '28px' }}>
          <IonSegmentButton value="chart" style={{ minHeight: '24px', height: '24px', '--padding-top': '0', '--padding-bottom': '0' }}>
            <IonLabel style={{ margin: 0, fontSize: '0.75rem', lineHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Charts</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="table" style={{ minHeight: '24px', height: '24px', '--padding-top': '0', '--padding-bottom': '0' }}>
            <IonLabel style={{ margin: 0, fontSize: '0.75rem', lineHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Tabular Data</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        {viewMode === 'chart' ? (
          <div>
            <IonItem lines="none" className="ion-margin-bottom" style={{ '--min-height': '36px' }}>
              <IonSelect 
                value={chartType} 
                onIonChange={e => setChartType(e.detail.value)} 
                interface="popover"
                style={{ fontSize: '0.85rem' }}
              >
                <IonSelectOption value="category">Category-wise</IonSelectOption>
                <IonSelectOption value="date">Day-wise</IonSelectOption>
              </IonSelect>
            </IonItem>
            
            {chartData.length === 0 ? (
              <div className="ion-text-center ion-padding ion-text-muted">No expenses to display</div>
            ) : (
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer>
                  <PieChart margin={{ top: 0, bottom: 0, left: 20, right: 20 }}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={(props: any) => {
                        const category = CATEGORIES.find(c => c.name === props.name);
                        const labelText = category?.name || props.name;
                        return (
                          <text
                            x={props.x}
                            y={props.y}
                            fill={props.fill}
                            textAnchor={props.x > props.cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                          >
                            <tspan x={props.x} dy="-0.5em">{labelText}</tspan>
                            <tspan x={props.x} dy="1.2em">{`${(props.percent * 100).toFixed(0)}%`}</tspan>
                          </text>
                        );
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => `${currencySymbol}\u2009${formatAmount(value)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <IonCard className="ion-margin-top ion-padding" style={{ padding: '12px' }}>
              <IonText color="dark">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '500' }}>Total Spent</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {currencyIcon ? <FontAwesomeIcon icon={currencyIcon} /> : currencySymbol}{'\u2009'}{formatAmount(chartData.reduce((sum, item) => sum + item.value, 0))}
                  </span>
                </div>
              </IonText>
            </IonCard>
          </div>
        ) : (
          <div>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <IonItem lines="none" color="light" style={{ borderRadius: '8px' }}>
                    <IonLabel position="stacked">Category</IonLabel>
                    <IonSelect value={filterCategory} onIonChange={e => setFilterCategory(e.detail.value)} interface="popover">
                      <IonSelectOption value="all">All</IonSelectOption>
                      {CATEGORIES.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)}
                    </IonSelect>
                  </IonItem>
                </IonCol>
                <IonCol size="6">
                  <IonItem lines="none" color="light" style={{ borderRadius: '8px' }}>
                    <IonLabel position="stacked">Source</IonLabel>
                    <IonSelect value={filterSource} onIonChange={e => setFilterSource(e.detail.value)} interface="popover">
                      <IonSelectOption value="all">All</IonSelectOption>
                      {SOURCES.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

             {filteredExpenses.length === 0 ? (
                <div className="ion-text-center ion-padding ion-text-muted">No expenses match filters</div>
             ) : (
                <IonList>
                  {filteredExpenses.map(exp => (
                    <IonItem key={exp.id}>
                      <IonLabel>
                        <h3>{CATEGORIES.find(c => c.id === exp.categoryId)?.name}</h3>
                        <p>{new Date(exp.date).toLocaleDateString()} • {SOURCES.find(s => s.id === exp.sourceId)?.name}</p>
                      </IonLabel>
                      <div slot="end" className="ion-text-right">
                        <IonText color="dark"><strong>
                          {currencyIcon ? <FontAwesomeIcon icon={currencyIcon} /> : currencySymbol}{'\u2009'}{formatAmount(exp.baseCurrencyAmount || exp.amount)}
                        </strong></IonText>
                      </div>
                    </IonItem>
                  ))}
                </IonList>
             )}
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default TripStatsModal;
