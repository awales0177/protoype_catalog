graph TD
  Catalog[Data Catalog]

  Catalog --> Dataset[Dataset]
  Catalog --> DataProduct[Data Product]
  Catalog --> DataArtifact[Data Artifact]
  Catalog --> DataAction[Data Action]

  %% Artifacts
  DataArtifact --> DataModel[Data Model]
  DataArtifact --> CuratedList[Curated List]
  DataArtifact --> DataTool[Data Tool]
  DataArtifact --> DataQualityRule[Data Quality Rule]
  DataArtifact --> System[System]

  %% Core Flow
  Dataset -->|feeds| DataProduct

  %% Artifact usage
  DataProduct -->|uses| DataArtifact
  Dataset -->|uses| DataArtifact

  %% Model applies ONLY to products
  DataModel -->|defines structure for| DataProduct

  %% Organization
  CuratedList -->|groups| Dataset
  CuratedList -->|groups| DataProduct
  CuratedList -->|groups| DataArtifact

  %% Processing
  DataTool -->|transforms / produces| DataProduct
  DataTool -->|processes| Dataset

  %% System relationships (UPDATED)
  System -->|hosts / runs| DataTool
  System -->|stores / serves| DataProduct
  Dataset -->|approved for| System

  %% Quality
  DataQualityRule -->|validates| Dataset
  DataQualityRule -->|validates| DataProduct

  %% Data Actions
  DataAction -->|acts on| Dataset
  DataAction -->|acts on| DataProduct
  DataAction -->|acts on| DataArtifact
  DataAction -->|uses| DataTool
  DataAction -->|executed in| System
