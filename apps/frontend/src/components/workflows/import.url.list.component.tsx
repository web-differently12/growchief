import { type FC, useCallback, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { useWorkflowsRequest } from "@growchief/frontend/requests/workflows.request.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import clsx from "clsx";

interface Platform {
  name: string;
  identifier: string;
  searchURL: {
    description: string;
    regex: Array<{ source: string; flag: string }>;
  };
}

interface FormData {
  [key: string]: string; // platform identifier -> URL value
}

interface ImportURLListComponentProps {
  id: string;
  close: () => void;
}

const PlatformInput: FC<{
  platform: Platform;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ platform, value, onChange, error }) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setIsValid(false);
      return;
    }

    // Test if value matches any of the platform's regex patterns
    const matchesAnyRegex = platform.searchURL.regex.some((regexObj) => {
      try {
        const regex = new RegExp(regexObj.source, regexObj.flag);
        return regex.test(value);
      } catch (error) {
        console.error("Invalid regex pattern:", regexObj, error);
        return false;
      }
    });

    setIsValid(matchesAnyRegex);
  }, [value, platform.searchURL.regex]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-[600] text-primary">{platform.name}</h3>
        {value.trim() && (
          <div
            className={clsx(
              "px-[8px] py-[2px] rounded-full text-[11px] font-[600] inline-flex items-center",
              isValid
                ? "bg-green-600/20 text-green-400"
                : "bg-red-600/20 text-red-400",
            )}
          >
            <div
              className={clsx(
                "w-[6px] h-[6px] rounded-full mr-[6px]",
                isValid ? "bg-green-400" : "bg-red-400",
              )}
            />
            {isValid ? "Valid" : "Invalid"}
          </div>
        )}
      </div>
      <div
        className="text-[13px] text-secondary mb-2"
        dangerouslySetInnerHTML={{ __html: platform.searchURL.description }}
      />
      <Input
        type="url"
        placeholder={`Enter ${platform.name} URL`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "transition-all",
          value.trim() &&
            (isValid
              ? "border-green-600/50 focus:border-green-600 focus:ring-green-600/20"
              : "border-red-600/50 focus:border-red-600 focus:ring-red-600/20"),
        )}
      />
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export const ImportURLListComponent: FC<ImportURLListComponentProps> = ({
  id,
  close,
}) => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const workflowsRequest = useWorkflowsRequest();
  const toaster = useToaster();

  const form = useForm<FormData>({
    defaultValues: {},
    mode: "onChange",
  });

  const { watch, setValue, handleSubmit, setError, clearErrors } = form;
  const formValues = watch();

  // Load platform data
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        setIsLoading(true);
        const { searchLink: data } = await workflowsRequest.importURLList(id);
        setPlatforms(data);

        // Initialize form with empty values for each platform
        const initialValues: FormData = {};
        data.forEach((platform) => {
          initialValues[platform.identifier] = "";
        });
        form.reset(initialValues);
      } catch (error) {
        console.error("Failed to load platforms:", error);
        toaster.show("Failed to load platform data", "warning");
        close();
      } finally {
        setIsLoading(false);
      }
    };

    loadPlatforms();
  }, []);

  // Validate that at least one URL is valid
  const validateForm = useCallback(() => {
    const hasValidURL = platforms.some((platform) => {
      const value = formValues[platform.identifier]?.trim();
      if (!value) return false;

      return platform.searchURL.regex.some((regexObj) => {
        try {
          const regex = new RegExp(regexObj.source, regexObj.flag);
          return regex.test(value);
        } catch {
          return false;
        }
      });
    });

    if (!hasValidURL) {
      setError("root", {
        type: "manual",
        message: "At least one valid URL is required",
      });
      return false;
    }

    clearErrors("root");
    return true;
  }, [platforms, formValues, setError, clearErrors]);

  // Check if submit button should be enabled
  const canSubmit = platforms.some((platform) => {
    const value = formValues[platform.identifier]?.trim();
    if (!value) return false;

    return platform.searchURL.regex.some((regexObj) => {
      try {
        const regex = new RegExp(regexObj.source, regexObj.flag);
        return regex.test(value);
      } catch {
        return false;
      }
    });
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        // Filter out empty URLs and collect them in an array
        const urls = Object.values(data)
          .filter((url) => url.trim())
          .map((url) => url.trim());

        await workflowsRequest.uploadLeads(id, urls);
        toaster.show("URLs imported successfully", "success");
        close();
      } catch (error) {
        console.error("Failed to import URLs:", error);
        toaster.show("Failed to import URLs", "warning");
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, toaster, close],
  );

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="text-[14px] text-secondary">Loading platforms...</div>
      </div>
    );
  }

  if (platforms.length === 0) {
    return (
      <div className="text-center">
        <div className="text-[14px] text-secondary mb-[16px]">
          No platforms available for import
        </div>
        <Button onClick={close} className="mx-auto">
          Close
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="text-[14px] text-secondary mb-[20px]">
            Import URLs from different platforms. Enter URLs that match the
            required patterns. At least one valid URL is required.
          </div>

          <div className="space-y-6">
            {platforms.map((platform) => (
              <PlatformInput
                key={platform.identifier}
                platform={platform}
                value={formValues[platform.identifier] || ""}
                onChange={(value) => setValue(platform.identifier, value)}
              />
            ))}
          </div>

          {form.formState.errors.root && (
            <div className="mt-4 p-3 bg-red-600/20 border border-red-600/30 rounded-[8px]">
              <p className="text-sm text-red-400">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-[12px] border-t border-background pt-[20px]">
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Importing..." : "Import URLs"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
