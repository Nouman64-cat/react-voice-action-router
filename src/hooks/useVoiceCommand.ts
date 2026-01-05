import { useEffect, useRef } from "react";
import { useVoiceContext } from "../components/VoiceContext";
import { VoiceCommand } from "../types";

export const useVoiceCommand = (command: VoiceCommand) => {
  const { register, unregister } = useVoiceContext();

  // 1. Keep a "Ref" to the latest command.
  // This allows the action function to change (e.g. updating state)
  // WITHOUT forcing us to unregister/re-register the command.
  const commandRef = useRef(command);

  // Always update the ref on every render
  useEffect(() => {
    commandRef.current = command;
  });

  useEffect(() => {
    // 2. Register a "Proxy Command"
    // Instead of registering the raw command, we register a proxy
    // that always calls the LATEST version stored in the ref.
    const proxyCommand: VoiceCommand = {
      id: command.id,
      description: command.description,
      phrase: command.phrase,
      action: () => {
        // When triggered, execute whatever the current action is
        commandRef.current.action();
      },
    };

    register(proxyCommand);

    return () => {
      unregister(proxyCommand.id);
    };
    // 3. Only re-register if the ID changes.
    // We intentionally ignore 'command' or 'command.action' changes here.
  }, [register, unregister, command.id]);
};
