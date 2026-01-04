# FAQ
**Q: What is the main goal of this model and what does it take as input?** **A:** The goal is to predict which RNA-Binding Protein (RBP) interacts with a specific piece of RNA. The input is a 41-nucleotide (41nt) RNA sequence window. In later stages of the project, the model also takes in "signal features" derived from lab experiments, such as the maximum signal position and signal asymmetry.

**Q: Does the model just give a "yes" or "no" for one protein at a time?** **A:** No, the architecture is specifically designed to be **multi-output** and **probabilistic**. Instead of running a separate test for every protein, it outputs a score for every RBP in the dataset simultaneously. This allows the model to handle "uncertainty and overlapping binding," where multiple proteins might be interacting with the same RNA site.

**Q: What are "soft labels" and why aren't we using 100% binary "yes/no" labels?** **A:** Soft labels are **normalized signal strengths** from experimental data rather than hard binary categories. Using these allows the model to learn the intensity of a binding event. They are used during training as the "ground truth" for the loss function (like cross-entropy loss) and during validation to see how well the model’s predicted probabilities correlate with real-world signal.

**Q: What is a Softmax classifier in this context?** **A:** It is one of the recommended model architectures that turns the model's raw output into a probability distribution. This ensures that the scores for all RBPs sum up to 1.0, making it easy to rank which protein the model thinks is the most likely "winner" for a specific RNA sequence.

**Q: What is MRR and how does "rank" work here?** **A:** **MRR (Mean Reciprocal Rank)** is a metric used to evaluate the model's ranking performance. After the model outputs probabilities for all RBPs, you sort them from highest to lowest. The "rank" (k) is the position of the RBP that was actually observed in the lab. You take the reciprocal (1/k) and average it across all samples; the closer the average is to 1.0, the better the model is at putting the "correct" RBP at the top of the list.

**Q: What specific features is the model actually looking at in the RNA?** **A:** The project uses a layered approach:

• **Phase 2 (Sequence):** The model looks at **position-aware features** like 4-mer frequencies, individual nucleotide content (A/C/G/U), and 16 different dinucleotide combinations at every position in the 41nt window.

• **Phase 3 (Signal):** The model adds experimental data features like the **Max signal position**, **Distance from center**, **Asymmetry**, and **Entropy** of the signal distribution.

**Q: Is the "correct" RBP part of the input?** **A:** No. The model only sees the RNA sequence and signal features. The "correct" RBP (the one found in the experimental soft labels) is only used during training to "teach" the model and during validation to see if the model's highest probability output matches the real-world observation.

**Q: What exactly are "shared peaks"?** **A:** Shared peaks are localized coordinates on an RNA molecule where multiple RNA-binding proteins (RBPs) may be targeting the same or overlapping spots. In this project, they are represented as a **41-nucleotide window**, and the goal is to use a model to figure out which specific RBP is responsible for the binding signal at that location.

**Q: What does "motif-free" mean in this context?** **A:** It means the model doesn't rely on a "cheat sheet" of known sequence patterns (motifs) to make its predictions. Instead, it uses a data-driven approach, looking at raw features like 4-mers and experimental signals to discover its own patterns. Predefined motifs are only used at the end to validate that the model’s "homework" matches known biology.

**Q: What is a Position Weight Matrix (PWM)?** **A:** A PWM is a traditional mathematical grid that shows the probability of seeing a specific nucleotide at each position in a motif. While they are standard in biology, they have a major limitation: they assume each position is independent. This project aims to outperform PWMs by using methods like CNNs and K-mer set memory (KSM) that capture more complex dependencies.

**Q: Why are nucleotides and dinucleotides used as features?** **A:** These are "position-aware" features that tell the model exactly what base (A, C, G, or U) or pair of bases (like AA or GC) is at every single spot in the 41nt window. This allows the model to build a high-resolution map of the binding site and pick up on subtle sequence patterns that define a protein's "landing pad".

**Q: Is a crosslink a numerical value, and does it create the "peak height"?** **A:** Yes, a crosslink is recorded as a numerical **read count** from an experiment. The "peak height"—formally called **peak intensity**—is simply the highest numerical value in that signal. The model uses this intensity, along with the "shape" of the signal (like its sharpness or asymmetry), to identify the RBP.

**Q: How does "AUC" relate to the crosslink signal?** **A:** In terms of signal geometry, the total signal intensity (or total reads) can be thought of as the "Area Under the Curve" (AUC) of the crosslink distribution. However, it’s important to distinguish this from **AUC-ROC**, which the project uses as a performance metric to measure how accurately the model ranks and identifies the correct RBPs.

**Q: What is the difference between a "feature" and a "channel" in a CNN?** **A:** In a classical model like LightGBM, all data points are flattened into a 1D list of "features". In a CNN, **channels** are like spatial layers (similar to RGB layers in an image). For example, the model uses 4 channels for the sequence (A, C, G, U) and adds the crosslink signal as a 5th channel, allowing it to see exactly how the sequence and the signal align at every position.

**Q: Why is the POLARIS architecture relevant here?** **A:** POLARIS is a two-layer CNN specifically designed to find **localized binding affinity** in small windows. Since this project focuses on a narrow 41nt window, the POLARIS architecture serves as a perfect blueprint for learning "PWM-like representations" automatically without needing massive amounts of data or long-range context.

**Q: How do the project phases map to these different data types?** **A:** **Phase 2** is the sequence-only phase, focusing on nucleotides, dinucleotides, and 4-mers (the first 4 channels in a CNN). **Phase 3** upgrades the model by adding the **crosslink signal features** (the 5th channel), combining the RNA's "identity" with experimental data for better accuracy.
# Open Questions
* What is cross linking?
* What is cross entropy?
* MRR?
* What is 4-mer frequencies?
* nucleotide content (A/C/G/U)
* dinucleotide combinations
* peak intensity
* crosslink distribution
* PWM vs CNN?