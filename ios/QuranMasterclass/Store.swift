import StoreKit

/// Masterclass Premium: a one-time In-App Purchase (non-consumable) that unlocks the full Shams course and more.
/// StoreKit 2 checks every transaction on the device; the signed transaction (JWS) is also sent to the website,
/// so a learner who is signed in has Premium on the web and on other devices too.
@MainActor
final class Store {
    static let shared = Store()
    static let premiumID = "com.quranmasterclass.app.premium"

    private(set) var premium = false
    private(set) var price: String?
    private(set) var jws: String?
    private var product: Product?
    private var updates: Task<Void, Never>?
    /// called whenever premium, price or jws change
    var onChange: (() -> Void)?

    func start() {
        guard updates == nil else { return }
        // purchases that finish outside the app (Ask to Buy, a second device, refunds) arrive here
        updates = Task { [weak self] in
            for await result in Transaction.updates {
                if case .verified(let transaction) = result { await transaction.finish() }
                await self?.refresh()
            }
        }
        Task {
            await refresh()
            await loadProduct()
        }
    }

    func loadProduct() async {
        guard let p = try? await Product.products(for: [Self.premiumID]).first else { return }
        product = p
        price = p.displayPrice
        onChange?()
    }

    func refresh() async {
        var has = false
        var token: String?
        for await result in Transaction.currentEntitlements {
            if case .verified(let t) = result, t.productID == Self.premiumID, t.revocationDate == nil {
                has = true
                token = result.jwsRepresentation
            }
        }
        if has != premium || token != jws {
            premium = has
            jws = token
            onChange?()
        }
    }

    /// "purchased", "pending" (Ask to Buy), "cancelled", "unavailable" or "failed"
    func buy() async -> String {
        if product == nil { await loadProduct() }
        guard let product else { return "unavailable" }
        do {
            switch try await product.purchase() {
            case .success(let result):
                guard case .verified(let transaction) = result else { return "failed" }
                await transaction.finish()
                premium = true
                jws = result.jwsRepresentation
                onChange?()
                return "purchased"
            case .pending:
                return "pending"
            case .userCancelled:
                return "cancelled"
            @unknown default:
                return "failed"
            }
        } catch {
            return "failed"
        }
    }

    /// "restored", "none" or "failed"
    func restore() async -> String {
        do { try await AppStore.sync() } catch { return "failed" }
        await refresh()
        return premium ? "restored" : "none"
    }
}
