import React from "react";

export const LoadingContext = React.createContext({
	isLoading: false,
	setIsLoading: (value: boolean) => {
		console.log(value);
	},
});

export const LoadingProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<LoadingContext.Provider
			value={{ isLoading: false, setIsLoading: jest.fn() }}
		>
			{children}
		</LoadingContext.Provider>
	);
};

export const useLoading = () => {
	return {
		isLoading: false,
		setIsLoading: jest.fn(),
	};
};
