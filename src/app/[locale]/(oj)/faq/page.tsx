"use client";

import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/glass/glass-card";

export default function FAQPage() {
  const t = useTranslations("m");

  return (
    <div className="mx-auto max-w-3xl">
      <GlassPanel title={t("Frequently_Asked_Questions")}>
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h3 className="mb-2 font-semibold text-[var(--fg-secondary)]">
              {t("Where_is_the_input_and_the_output")}
            </h3>

            <p className="text-muted">
              {t("Where_is_the_input_and_the_output_answer_part_1")}{" "}
              <code className="rounded bg-white/10 px-1">{t("Standard_Input")}</code>{" "}

              {t("Where_is_the_input_and_the_output_answer_part_3")}{" "}
              <code className="rounded bg-white/10 px-1">{t("Standard_Output")}</code>

              . {t("Where_is_the_input_and_the_output_answer_part_5")}{" "}
              <code className="rounded bg-white/10 px-1">scanf</code>{" "}

              {t("Where_is_the_input_and_the_output_answer_part_6")}{" "}
              <code className="rounded bg-white/10 px-1">cin</code>{" "}

              {t("Where_is_the_input_and_the_output_answer_part_7")}{" "}
              <code className="rounded bg-white/10 px-1">printf</code>{" "}

              {t("Where_is_the_input_and_the_output_answer_part_8")}{" "}
              <code className="rounded bg-white/10 px-1">cout</code>{" "}

              {t("Where_is_the_input_and_the_output_answer_part_9")}{" "}
              <strong>Runtime Error</strong>.

            </p>

          </section>

          <section>
            <h3 className="mb-2 font-semibold text-[var(--fg-secondary)]">
              {t("What_is_the_meaning_of_submission_execution_time")}
            </h3>

            <p className="text-muted">
              {t("What_is_the_meaning_of_submission_execution_time_answer")}
            </p>

          </section>

          <section>
            <h3 className="mb-2 font-semibold text-[var(--fg-secondary)]">
              {t("How_Can_I_use_CPP_Int64")}
            </h3>

            <p className="text-muted">
              {t("How_Can_I_use_CPP_Int64_answer_part_1")}{" "}
              <code className="rounded bg-white/10 px-1">long long</code>{" "}

              {t("How_Can_I_use_CPP_Int64_answer_part_2")}{" "}
              <code className="rounded bg-white/10 px-1">cin/cout</code> {t("or")}{" "}

              <code className="rounded bg-white/10 px-1">%lld</code>.{" "}

              {t("using")}{" "}
              <code className="rounded bg-white/10 px-1">%I64d</code>{" "}

              {t("How_Can_I_use_CPP_Int64_answer_part_3")} Wrong Answer.
            </p>

          </section>

          <section>
            <h3 className="mb-2 font-semibold text-[var(--fg-secondary)]">
              {t("Java_specifications")}
            </h3>

            <p className="text-muted">
              {t("Java_specifications_answer_part_1")}{" "}
              <code className="rounded bg-white/10 px-1">Main</code>{" "}

              {t("Java_specifications_answer_part_2")}{" "}
              <code className="rounded bg-white/10 px-1">Main</code>{" "}

              {t("Java_specifications_answer_part_3")}
            </p>

          </section>

          <section>
            <h3 className="mb-2 font-semibold text-[var(--fg-secondary)]">
              {t("About_presentation_error")}
            </h3>

            <p className="text-muted">
              {t("About_presentation_error_answer_part_1")} {t("last")}{" "}
              {t("About_presentation_error_answer_part_2")} Wrong Answer.
            </p>

          </section>

          <section>
            <h3 className="mb-2 font-semibold text-[var(--fg-secondary)]">
              {t("How_to_report_bugs")}
            </h3>

            <p className="text-muted">
              {t("How_to_report_bugs_answer_part_1")}{" "}
              <a
                href="https://github.com/QingdaoU/OnlineJudge"
                className="text-[var(--fg-secondary)] underline"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>

              . {t("How_to_report_bugs_answer_part_2")}
            </p>

          </section>

        </div>

      </GlassPanel>

    </div>

  );
}
