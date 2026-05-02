export const architecture = {
  title: "High-Level System Architecture",
  content: `1. Agentic Orchestrator (Manager)
   - Core Python/Kotlin service running as the brain.
   - Modules: Planning Agent, Coding Agent, Debugging Agent.
   - Execution Loop: Plan -> Generate -> Execute -> Analyze -> Feedback.

2. LocalAdbService (Execution Layer)
   - Binds to Shizuku API for elevated privileges.
   - Connects to 127.0.0.1 (Wireless Debugging Loopback).
   - Executes pm, am, logcat, and dumpsys securely.
   - Failsafe: Hardcoded PID exclusion from task-killing commands.

3. Virtual Environment (Sandbox Layer)
   - KVM or Android Work Profile/Multi-User Space.
   - Exposes an isolated app context for running user-generated APKs natively.

4. UI / Editor Surface (Presentation Layer)
   - Jetpack Compose / React UI acting as the Frontend.
   - LSP Client integrated for code completion.
   - Smart Terminal syncing with LocalAdbService streams.`
};

export const libraries = {
  title: "Required Libraries & SDKs",
  content: `- Shizuku API (rikka.shizuku:api) - For privileged execution.
- Jetpack Compose - For UI and Artifact generation.
- Termux / Android Terminal Emulator (ptrace / libts) - For Terminal backend.
- LSP SDK (e.g. Eclipse LSP4J) - For Language Server integration.
- KVM Android bindings / Multi-User APIs - For Sandbox space.
- Kotlinx Coroutines - For asynchronous Agent orchestration.
- Gemini API SDK - For Agent Intelligence.`
};

export const kotlinCode = `package com.antigravity.mobile.core.adb

import dev.rikka.shizuku.Shizuku
import dev.rikka.shizuku.ShizukuRemoteProcess
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import android.os.Process
import android.util.Log

class LocalAdbService {
    private val TAG = "LocalAdbService"
    private val myPid = Process.myPid().toString()

    init {
        // Request Shizuku permission on init if not granted
        if (Shizuku.checkSelfPermission() != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            Shizuku.requestPermission(0)
        }
    }

    suspend fun executeCommand(command: String): String = withContext(Dispatchers.IO) {
        if (!Shizuku.pingBinder()) {
            return@withContext "Error: Shizuku is not running or accessible."
        }
        
        // CRITICAL SAFETY CONSTRAINT: Prevent self-termination
        if (isDestructiveCommand(command) && command.contains(myPid)) {
            Log.w(TAG, "Blocked destructive command targeting own PID: $myPid")
            return@withContext "Execution Blocked: Cannot target AntiGravity Mobile Pro PID."
        }

        try {
            val process: ShizukuRemoteProcess = Shizuku.newProcess(arrayOf("sh", "-c", command), null, null)
            val output = process.inputStream.bufferedReader().use { it.readText() }
            val error = process.errorStream.bufferedReader().use { it.readText() }
            
            process.waitFor()
            
            if (error.isNotEmpty()) {
                Log.e(TAG, "Command Error: $error")
                return@withContext output + "\\nError: $error"
            }
            return@withContext output
        } catch (e: Exception) {
            Log.e(TAG, "Failed to execute: $command", e)
            return@withContext "Exception: \${e.message}"
        }
    }

    private fun isDestructiveCommand(cmd: String): Boolean {
        // Pattern match for kill, am force-stop, etc.
        val destructiveKeywords = listOf("kill", "force-stop", "kill-all")
        return destructiveKeywords.any { cmd.contains(it) }
    }
}
`;

export const pythonCode = `import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AgenticManager")

class AgenticManager:
    def __init__(self):
        self.state = "INIT"
        self.plan = []
        
    async def bootstrap(self):
        logger.info("Initializing Agentic Manager...")
        await self.enter_planning_mode()
        
    async def enter_planning_mode(self):
        self.state = "PLANNING"
        logger.info("--- ENTERING PLANNING MODE ---")
        logger.info("Generating Step-by-Step Roadmap to prevent hallucinations...")
        
        self.plan = [
            "1. Verify Shizuku Binder state.",
            "2. Establish 127.0.0.1 ADB loopback pipeline.",
            "3. Enforce PID Safeguard constraints.",
            "4. Mount Virtual Phone Sandbox (Work Profile).",
            "5. Initialize LSP Backend for Python/Kotlin.",
        ]
        
        for step in self.plan:
            logger.info(f"PLAN: {step}")
            await asyncio.sleep(0.5) # Simulate AI thinking
            
        logger.info("Plan finalized. Ready for execution phase.")
        self.state = "READY"

if __name__ == "__main__":
    manager = AgenticManager()
    asyncio.run(manager.bootstrap())
`;
