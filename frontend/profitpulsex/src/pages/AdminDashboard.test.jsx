import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from './AdminDashboard';

describe('AdminDashboard', () => {
    it('renders Admin Dashboard heading', () => {
        render(<AdminDashboard />);
        const headingElement = screen.getByText(/Admin Dashboard/i);
        expect(headingElement).toBeInTheDocument();
    });

    // USER MANAGEMENT TESTS
    it('renders User Management tab by default', () => {
        render(<AdminDashboard />);
        const userManagementButton = screen.getByText(/User Management/i);
        expect(userManagementButton).toHaveClass('bg-lightgreen text-black');
    });

    it('switches to Model Management tab', async () => {
        render(<AdminDashboard />);
        const modelManagementButton = screen.getByText(/Model Management/i);
        fireEvent.click(modelManagementButton);
        await waitFor(() => expect(modelManagementButton).toHaveClass('bg-lightgreen text-black'));
    });

    // MODEL MANAGEMENT TESTS
    it('selects ticker from Model Management Tab', async () => {
        render(<AdminDashboard />);
        const modelManagementButton = screen.getByText(/Model Management/i);
        fireEvent.click(modelManagementButton);
        await waitFor(() => expect(modelManagementButton).toHaveClass('bg-lightgreen text-black'));

        // Select an option from the 'Select Ticker' dropdown menu
        const metricsDropdown = screen.getByRole('combobox');
        fireEvent.change(metricsDropdown, { target: { value: 'GM' } });

        // Verify that the selected option is displayed
        expect(metricsDropdown.value).toBe('GM');
    });

    // PERFORMANCE TAB TESTING
    it('switches to Performance tab', async () => {
        render(<AdminDashboard />);
        const performanceButton = screen.getByText(/Performance/i);
        fireEvent.click(performanceButton);
        await waitFor(() => expect(performanceButton).toHaveClass('bg-lightgreen text-black'));
    });

    it('opens Metric Legend popup', async () => {
        render(<AdminDashboard />);

        const performanceButton = screen.getByText(/Performance/i);
        fireEvent.click(performanceButton);
        await waitFor(() => expect(performanceButton).toHaveClass('bg-lightgreen text-black'));

        const metricLegendButton = screen.getByText(/Metric Legend/i);
        fireEvent.click(metricLegendButton);
        const metricPopup = screen.getByText(/Metric Legend/i);
        expect(metricPopup).toBeInTheDocument();
    });

    it('selects an option from the Ticker Metrics dropdown menu', async () => {
        render(<AdminDashboard />);

        // Switch to Performance tab
        const performanceButton = screen.getByText(/Performance/i);
        fireEvent.click(performanceButton);
        await waitFor(() => expect(performanceButton).toHaveClass('bg-lightgreen text-black'));

        // Select an option from the Ticker Metrics dropdown menu
        const metricsDropdown = screen.getByRole('combobox');
        fireEvent.change(metricsDropdown, { target: { value: 'TSLA' } });

        // Verify that the selected option is displayed
        expect(metricsDropdown.value).toBe('TSLA');
    });

    // LOGS TAB TESTING
    it('switches to Logs tab', async () => {
        render(<AdminDashboard />);
        const logsButton = screen.getByText(/Logs/i);
        fireEvent.click(logsButton);
        await waitFor(() => expect(logsButton).toHaveClass('bg-lightgreen text-black'));
    });


    

    

    // Add more tests as needed
});