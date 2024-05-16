import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import Home from '../screens/Home'; // Import the component to be tested
import firestore from '@react-native-firebase/firestore';

// Mocking firestore module
jest.mock('@react-native-firebase/firestore', () => ({
  collection: jest.fn(() => ({
    get: jest.fn(() => ({
      docs: [
        {
          id: '1',
          data: () => ({
            Title: 'Event 1',
            Date: '2024-04-15',
            Time: '10:00 AM',
            City: 'New York',
            Useremail: 'example@example.com',
            uri: 'http://example.com/image1.jpg',
            uri2: 'http://example.com/image2.jpg',
          }),
        },
      ],
    })),
  })),
}));

// Mocking useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({navigate: jest.fn()})),
}));

describe('Home Component', () => {
  it('renders correctly', async () => {
    // Render the Home component
    const {getByText, getByTestId} = render(<Home />);

    // Wait for the component to finish loading
    await waitFor(() => {});

    // Assertions
    expect(getByText('Upcoming Events in')).toBeTruthy();
    expect(getByText('Event 1')).toBeTruthy();
    expect(getByText('2024-04-15')).toBeTruthy();
    expect(getByText('10:00 AM')).toBeTruthy();
    expect(getByText('New York')).toBeTruthy();
    expect(getByTestId('event-image')).toBeTruthy();
    expect(getByTestId('profile-image')).toBeTruthy();
  });

  // Add more test cases as needed to cover different scenarios
});
