"""
Data Ingestion Layer
=====================
Layer 1: Handles batch and single transaction ingestion with schema validation.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import hashlib
import json


class TransactionInput(BaseModel):
    """Schema for incoming financial transactions."""
    transaction_id: Optional[str] = None
    timestamp: Optional[str] = None
    type: str = Field(..., description="Transaction type: journal_entry, payment, invoice, refund, transfer, adjustment")
    amount: float = Field(..., gt=0, description="Transaction amount (must be positive)")
    debit_account: str = Field(..., description="Debit account code")
    credit_account: str = Field(..., description="Credit account code")
    debit_amount: Optional[float] = None
    credit_amount: Optional[float] = None
    description: Optional[str] = ""
    initiated_by: str = Field(..., description="User who initiated the transaction")
    approved_by: Optional[str] = None
    currency: Optional[str] = "USD"
    status: Optional[str] = "pending"
    department: Optional[str] = None
    reference_number: Optional[str] = None
    after_hours_override: Optional[bool] = False

    @validator('type')
    def validate_type(cls, v):
        valid_types = {"journal_entry", "payment", "invoice", "refund", "transfer", "adjustment"}
        if v not in valid_types:
            raise ValueError(f"Invalid transaction type: {v}. Must be one of {valid_types}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "type": "payment",
                "amount": 15000.00,
                "debit_account": "5100",
                "credit_account": "1000",
                "description": "Vendor payment for Q1 services",
                "initiated_by": "alice.johnson",
                "approved_by": "mgr.sarah"
            }
        }


class BatchIngestRequest(BaseModel):
    """Schema for batch transaction ingestion."""
    transactions: List[TransactionInput]


class IngestResult(BaseModel):
    """Result of ingestion validation."""
    valid: bool
    transaction_id: str
    timestamp: str
    raw_data: dict
    validation_errors: List[str] = []
    warnings: List[str] = []


def ingest_single(txn_input: TransactionInput) -> IngestResult:
    """
    Validate and enrich a single transaction for pipeline processing.
    """
    errors = []
    warnings = []

    # Auto-generate transaction ID if missing
    if not txn_input.transaction_id:
        txn_input.transaction_id = _generate_txn_id(txn_input)

    # Auto-set timestamp if missing
    if not txn_input.timestamp:
        txn_input.timestamp = datetime.utcnow().isoformat() + "Z"
        warnings.append("Timestamp was missing — auto-set to current UTC time")

    # Default debit/credit amounts to the transaction amount
    raw = txn_input.model_dump()
    if raw.get("debit_amount") is None:
        raw["debit_amount"] = raw["amount"]
        warnings.append("debit_amount defaulted to amount")
    if raw.get("credit_amount") is None:
        raw["credit_amount"] = raw["amount"]
        warnings.append("credit_amount defaulted to amount")

    # Validate amount is reasonable
    if raw["amount"] <= 0:
        errors.append("Amount must be positive")
    if raw["amount"] > 100_000_000:
        warnings.append(f"Extremely large amount: ${raw['amount']:,.2f}")

    # Check for empty required strings
    if not raw.get("debit_account", "").strip():
        errors.append("debit_account is empty")
    if not raw.get("credit_account", "").strip():
        errors.append("credit_account is empty")
    if not raw.get("initiated_by", "").strip():
        errors.append("initiated_by is empty")

    return IngestResult(
        valid=len(errors) == 0,
        transaction_id=raw["transaction_id"],
        timestamp=raw["timestamp"],
        raw_data=raw,
        validation_errors=errors,
        warnings=warnings,
    )


def ingest_batch(batch: BatchIngestRequest) -> List[IngestResult]:
    """Validate and enrich a batch of transactions."""
    results = []
    for txn in batch.transactions:
        result = ingest_single(txn)
        results.append(result)
    return results


def _generate_txn_id(txn: TransactionInput) -> str:
    """Generate a deterministic transaction ID from content hash."""
    content = f"{txn.amount}:{txn.debit_account}:{txn.credit_account}:{txn.initiated_by}:{datetime.utcnow().isoformat()}"
    hash_val = hashlib.sha256(content.encode()).hexdigest()[:8].upper()
    return f"TXN-{datetime.utcnow().strftime('%Y%m%d')}-{hash_val}"
