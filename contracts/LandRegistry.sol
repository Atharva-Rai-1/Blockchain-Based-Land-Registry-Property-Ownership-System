// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandRegistry
 * @notice Educational/dummy-data prototype for property registration,
 *         verification, ownership transfer, and auditable history.
 *
 * IMPORTANT:
 * This contract does NOT create or prove legally valid property ownership.
 * It is a blockchain course project using synthetic property data and
 * test wallets only.
 */
contract LandRegistry {
    address public admin;

    // Additional trusted accounts allowed to perform authority operations.
    mapping(address => bool) public authorities;

    enum PropertyStatus {
        REGISTERED,
        VERIFIED,
        TRANSFER_PENDING, // Reserved for a future multi-step transfer workflow.
        TRANSFERRED,
        DISPUTED,
        BLOCKED
    }

    struct Property {
        uint256 propertyId;
        string propertyNumber;
        string location;
        uint256 area; // Example unit: square feet. Unit must be agreed by the application.
        string propertyType;
        address currentOwner;
        address previousOwner;
        bytes32 documentHash;
        bool verified;
        PropertyStatus status;
        uint256 registeredAt;
        uint256 lastTransferredAt;
    }

    // propertyId => Property
    mapping(uint256 => Property) private properties;

    // Active property IDs for each current owner.
    mapping(address => uint256[]) private ownerProperties;

    // propertyId => index + 1 inside ownerProperties[currentOwner].
    mapping(address => mapping(uint256 => uint256)) private ownerPropertyIndex;

    // Complete on-chain owner sequence for each property.
    mapping(uint256 => address[]) private ownershipHistory;

    event AuthorityAdded(address indexed account);
    event AuthorityRemoved(address indexed account);

    event PropertyRegistered(
        uint256 indexed propertyId,
        string propertyNumber,
        address indexed initialOwner,
        bytes32 documentHash,
        uint256 registeredAt
    );

    event PropertyVerified(
        uint256 indexed propertyId,
        address indexed verifier,
        uint256 verifiedAt
    );

    event OwnershipTransferred(
        uint256 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 transferredAt
    );

    event PropertyStatusUpdated(
        uint256 indexed propertyId,
        PropertyStatus oldStatus,
        PropertyStatus newStatus,
        address indexed updatedBy,
        uint256 updatedAt
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Only authority");
        _;
    }

    modifier onlyExistingProperty(uint256 _propertyId) {
        require(propertyExists(_propertyId), "Property does not exist");
        _;
    }

    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(propertyExists(_propertyId), "Property does not exist");
        require(
            properties[_propertyId].currentOwner == msg.sender,
            "Caller is not current owner"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        authorities[msg.sender] = true;
        emit AuthorityAdded(msg.sender);
    }

    // -------------------------
    // Authority administration
    // -------------------------

    function addAuthority(address _account) external onlyAdmin {
        require(_account != address(0), "Invalid authority");
        require(!authorities[_account], "Already authority");

        authorities[_account] = true;
        emit AuthorityAdded(_account);
    }

    function removeAuthority(address _account) external onlyAdmin {
        require(_account != address(0), "Invalid authority");
        require(_account != admin, "Admin must remain authority");
        require(authorities[_account], "Not an authority");

        authorities[_account] = false;
        emit AuthorityRemoved(_account);
    }

    // -------------------------
    // Property registration
    // -------------------------

    function registerProperty(
        uint256 _propertyId,
        string calldata _propertyNumber,
        string calldata _location,
        uint256 _area,
        string calldata _propertyType,
        address _initialOwner,
        bytes32 _documentHash
    ) external onlyAuthority {
        require(_propertyId != 0, "Property ID cannot be zero");
        require(!propertyExists(_propertyId), "Property ID already exists");
        require(bytes(_propertyNumber).length > 0, "Property number required");
        require(bytes(_location).length > 0, "Location required");
        require(_area > 0, "Area must be greater than zero");
        require(bytes(_propertyType).length > 0, "Property type required");
        require(_initialOwner != address(0), "Owner cannot be zero address");
        require(_documentHash != bytes32(0), "Document hash required");

        Property storage p = properties[_propertyId];

        p.propertyId = _propertyId;
        p.propertyNumber = _propertyNumber;
        p.location = _location;
        p.area = _area;
        p.propertyType = _propertyType;
        p.currentOwner = _initialOwner;
        p.previousOwner = address(0);
        p.documentHash = _documentHash;
        p.verified = false;
        p.status = PropertyStatus.REGISTERED;
        p.registeredAt = block.timestamp;
        p.lastTransferredAt = 0;

        _addPropertyToOwner(_initialOwner, _propertyId);
        ownershipHistory[_propertyId].push(_initialOwner);

        emit PropertyRegistered(
            _propertyId,
            _propertyNumber,
            _initialOwner,
            _documentHash,
            block.timestamp
        );
    }

    // -------------------------
    // Verification
    // -------------------------

    function verifyProperty(
        uint256 _propertyId
    ) external onlyAuthority onlyExistingProperty(_propertyId) {
        Property storage p = properties[_propertyId];

        require(!p.verified, "Property already verified");
        require(
            p.status == PropertyStatus.REGISTERED,
            "Property not in registrable state"
        );

        p.verified = true;
        p.status = PropertyStatus.VERIFIED;

        emit PropertyVerified(
            _propertyId,
            msg.sender,
            block.timestamp
        );
    }

    // -------------------------
    // Ownership transfer
    // -------------------------

    function transferOwnership(
        uint256 _propertyId,
        address _newOwner
    )
        external
        onlyExistingProperty(_propertyId)
        onlyPropertyOwner(_propertyId)
    {
        Property storage p = properties[_propertyId];

        require(_newOwner != address(0), "New owner cannot be zero address");
        require(_newOwner != p.currentOwner, "New owner must differ");
        require(p.verified, "Property must be verified");
        require(
            p.status != PropertyStatus.DISPUTED &&
                p.status != PropertyStatus.BLOCKED,
            "Property cannot be transferred"
        );

        address oldOwner = p.currentOwner;

        p.previousOwner = oldOwner;
        p.currentOwner = _newOwner;
        p.lastTransferredAt = block.timestamp;
        p.status = PropertyStatus.TRANSFERRED;

        _removePropertyFromOwner(oldOwner, _propertyId);
        _addPropertyToOwner(_newOwner, _propertyId);

        ownershipHistory[_propertyId].push(_newOwner);

        emit OwnershipTransferred(
            _propertyId,
            oldOwner,
            _newOwner,
            block.timestamp
        );
    }

    // -------------------------
    // Status management
    // -------------------------

    /**
     * @notice Authority can mark a record as disputed/blocked or restore it
     *         to a logically valid state.
     *
     * TRANSFER_PENDING is intentionally reserved for the advanced workflow.
     */
    function updatePropertyStatus(
        uint256 _propertyId,
        PropertyStatus _newStatus
    ) external onlyAuthority onlyExistingProperty(_propertyId) {
        Property storage p = properties[_propertyId];
        PropertyStatus oldStatus = p.status;

        require(
            _newStatus != PropertyStatus.TRANSFER_PENDING,
            "Use advanced transfer workflow for pending state"
        );

        if (_newStatus == PropertyStatus.REGISTERED) {
            require(!p.verified, "Verified property cannot be REGISTERED");
            require(
                ownershipHistory[_propertyId].length == 1,
                "Transferred property cannot return to REGISTERED"
            );
        }

        if (_newStatus == PropertyStatus.VERIFIED) {
            require(p.verified, "Property must be verified first");
        }

        if (_newStatus == PropertyStatus.TRANSFERRED) {
            require(
                ownershipHistory[_propertyId].length > 1,
                "Property has not been transferred"
            );
        }

        p.status = _newStatus;

        emit PropertyStatusUpdated(
            _propertyId,
            oldStatus,
            _newStatus,
            msg.sender,
            block.timestamp
        );
    }

    // -------------------------
    // Read functions
    // -------------------------

    function propertyExists(uint256 _propertyId) public view returns (bool) {
        return properties[_propertyId].propertyId != 0;
    }

    function getProperty(
        uint256 _propertyId
    )
        external
        view
        onlyExistingProperty(_propertyId)
        returns (Property memory)
    {
        return properties[_propertyId];
    }

    function getPropertiesByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }

    function getOwnershipHistory(
        uint256 _propertyId
    )
        external
        view
        onlyExistingProperty(_propertyId)
        returns (address[] memory)
    {
        return ownershipHistory[_propertyId];
    }

    // -------------------------
    // Internal owner-list helpers
    // -------------------------

    function _addPropertyToOwner(
        address _owner,
        uint256 _propertyId
    ) internal {
        ownerProperties[_owner].push(_propertyId);
        ownerPropertyIndex[_owner][_propertyId] =
            ownerProperties[_owner].length;
    }

    function _removePropertyFromOwner(
        address _owner,
        uint256 _propertyId
    ) internal {
        uint256 indexPlusOne = ownerPropertyIndex[_owner][_propertyId];
        require(indexPlusOne != 0, "Owner property index missing");

        uint256 index = indexPlusOne - 1;
        uint256 lastIndex = ownerProperties[_owner].length - 1;

        if (index != lastIndex) {
            uint256 lastPropertyId = ownerProperties[_owner][lastIndex];
            ownerProperties[_owner][index] = lastPropertyId;
            ownerPropertyIndex[_owner][lastPropertyId] = index + 1;
        }

        ownerProperties[_owner].pop();
        delete ownerPropertyIndex[_owner][_propertyId];
    }
}
