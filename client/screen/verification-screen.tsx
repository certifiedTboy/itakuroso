import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const VerificationScreen = () => {
  return (
    <ThemedView>
      <ThemedText>Verification Screen</ThemedText>
      <ThemedButton>
        <ThemedText>Verify</ThemedText>
      </ThemedButton>
    </ThemedView>
  );
};

export default VerificationScreen;
