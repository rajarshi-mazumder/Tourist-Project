const aiController = require("../../aicontrollers/aiController");

const attractionsController = {
    getAttractions: async (req, res) => { 
        const { city_name, keywords } = req.body;
        try {
        const attractionsPromptPath = path.resolve(
            __dirname,
            "../../prompts/AttractionsPrompt.txt"
        );
        const attractionsPrompt = fs.readFileSync(attractionsPromptPath, "utf-8");

        // Replacing placeholders in the prompt
        const prompt = attractionsPrompt
            .replace(/{city_name}/g, city_name)
            .replace(/{keywords}/g, keywords);

        let responseText;
        try {
            responseText = await aiController.generateAIResponse(prompt, task);
            console.log("AI Response:", responseText);
        } catch (error) {
            console.error("Error generating AI response:", error);
            return {
                success: false,
                message: "Failed to generate attractions",
                error: error.message
            };
        }

        // Parse AI Response
        let attractions;
        try {
            attractions = JSON.parse(responseText);
            if (!attractions || !attractions.attractions) {
                throw new Error("Invalid AI response format");
            }
            return attractions; // Return the formatted attractions data
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            return {
                success: false,
                message: "Failed to process AI response",
                error: parseError.message
            };
        }
    } catch (error) {
        console.error("Error processing getAttractions function:", error);
        return {
            success: false,
            message: "Unexpected error in fetching attractions",
            error: error.message
        };
    }
    }
}



module.exports = { attractionsController };