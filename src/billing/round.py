from decimal import Decimal, ROUND_HALF_EVEN

def round_half_even(value):
    return float(Decimal(str(value)).quantize(Decimal('0.01'), ROUND_HALF_EVEN))
