import { ActivityIndicator } from "react-native";

/**
 * LoaderSpinner component
 * This component is used to display a loading spinner.
 * It uses the ActivityIndicator component from react-native.
 *
 * @returns {JSX.Element} The LoaderSpinner component.
 */

type LoaderSpinnerProps = {
  size?: "small" | "large";
  color?: string;
};
const LoaderSpinner = ({ size, color }: LoaderSpinnerProps) => (
  <ActivityIndicator size={size} color={color} />
);

export default LoaderSpinner;
