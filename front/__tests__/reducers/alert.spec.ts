import { describe, it, expect } from 'vitest';
import alertReducer, { addAlert, removeAlert, resetAlert, AlertType } from 'front/store/alert.slice';

describe('alertSlice', () => {
  
  it('should return the initial state', () => {
    const initialState = { alerts: [] };
    const result = alertReducer(undefined, { type: '' });
    expect(result).toEqual(initialState);
  });

  it('should add an alert to an empty state', () => {
    const initialState = { alerts: [] };
    const newAlert = { message: 'Test Alert', type: AlertType.SUCCESS };
    const result = alertReducer(initialState, addAlert(newAlert));
    
    expect(result.alerts.length).toBe(1);
    expect(result.alerts[0].message).toBe('Test Alert');
    expect(result.alerts[0].type).toBe(AlertType.SUCCESS);
  });

  it('should add an alert and ensure unique IDs', () => {
    const initialState = { alerts: [{ id: 0, message: 'Existing Alert', type: AlertType.WARNING }] };
    const newAlert = { message: 'New Alert', type: AlertType.SUCCESS };
    const result = alertReducer(initialState, addAlert(newAlert));
    
    expect(result.alerts.length).toBe(2);
    expect(result.alerts[0].id).toBe(1);
    expect(result.alerts[0].message).toBe('New Alert');
    expect(result.alerts[1].id).toBe(0);
  });

  it('should remove an alert by ID', () => {
    const initialState = { alerts: [{ id: 0, message: 'Alert to be removed', type: AlertType.ERROR }] };
    const result = alertReducer(initialState, removeAlert(0));
    
    expect(result.alerts.length).toBe(0);
  });

  it('should handle the alert cap of 3 alerts', () => {
    const initialState = {
      alerts: [
        { id: 0, message: 'First Alert', type: AlertType.ERROR },
        { id: 1, message: 'Second Alert', type: AlertType.SUCCESS },
        { id: 2, message: 'Third Alert', type: AlertType.WARNING },
      ]
    };
    const newAlert = { message: 'New Alert', type: AlertType.SUCCESS };
    const result = alertReducer(initialState, addAlert(newAlert));
    
    expect(result.alerts.length).toBe(3);
    expect(result.alerts[0].message).toBe('New Alert'); // new alert is added at the beginning
    expect(result.alerts[2].message).toBe('Second Alert'); // the first alert is removed
  });

  it('should reset the state to initial state', () => {
    const initialState = {
      alerts: [
        { id: 0, message: 'Existing Alert', type: AlertType.ERROR }
      ]
    };
    const result = alertReducer(initialState, resetAlert());
    
    expect(result.alerts.length).toBe(0);
  });

});