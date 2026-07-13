// temporary
router.post(
    "/upload",
    upload.single("document"),
    documentController.upload
);