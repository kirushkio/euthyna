const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compile() {
  const contractsDir = path.resolve(__dirname, '../src');
  const vaultSource = fs.readFileSync(path.join(contractsDir, 'EuthynaVault.sol'), 'utf8');
  const erc20Source = fs.readFileSync(path.join(contractsDir, 'interfaces/IERC20.sol'), 'utf8');
  const venueSource = fs.readFileSync(path.join(contractsDir, 'interfaces/IVenueAdapter.sol'), 'utf8');

  const mockUSDCSource = `
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.20;

  contract MockUSDC {
      string public name = "USD Coin";
      string public symbol = "USDC";
      uint8 public decimals = 6;
      uint256 public totalSupply;
      mapping(address => uint256) public balanceOf;
      mapping(address => mapping(address => uint256)) public allowance;

      event Transfer(address indexed from, address indexed to, uint256 value);
      event Approval(address indexed owner, address indexed spender, uint256 value);

      function mint(address to, uint256 amount) external {
          balanceOf[to] += amount;
          totalSupply += amount;
          emit Transfer(address(0), to, amount);
      }

      function transfer(address recipient, uint256 amount) external returns (bool) {
          require(balanceOf[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");
          balanceOf[msg.sender] -= amount;
          balanceOf[recipient] += amount;
          emit Transfer(msg.sender, recipient, amount);
          return true;
      }

      function approve(address spender, uint256 amount) external returns (bool) {
          allowance[msg.sender][spender] = amount;
          emit Approval(msg.sender, spender, amount);
          return true;
      }

      function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
          require(balanceOf[sender] >= amount, "ERC20: transfer amount exceeds balance");
          require(allowance[sender][msg.sender] >= amount, "ERC20: allowance exceeded");
          allowance[sender][msg.sender] -= amount;
          balanceOf[sender] -= amount;
          balanceOf[recipient] += amount;
          emit Transfer(sender, recipient, amount);
          return true;
      }
  }
  `;

  const simYieldSource = fs.readFileSync(path.join(contractsDir, 'SimYieldVault.sol'), 'utf8');
  const erc4626Source = fs.readFileSync(path.join(contractsDir, 'adapters/ERC4626Adapter.sol'), 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'EuthynaVault.sol': { content: vaultSource },
      'SimYieldVault.sol': { content: simYieldSource },
      'adapters/ERC4626Adapter.sol': { content: erc4626Source },
      'interfaces/IERC20.sol': { content: erc20Source },
      'interfaces/IVenueAdapter.sol': { content: venueSource },
      'MockUSDC.sol': { content: mockUSDCSource }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  console.log('Compiling Solidity contracts with solc', solc.version(), '...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const fatal = output.errors.filter((e) => e.severity === 'error');
    if (fatal.length > 0) {
      throw new Error('Compilation errors:\n' + fatal.map((e) => e.formattedMessage).join('\n'));
    }
  }

  const artifacts = {
    EuthynaVault: {
      abi: output.contracts['EuthynaVault.sol']['EuthynaVault'].abi,
      bytecode: '0x' + output.contracts['EuthynaVault.sol']['EuthynaVault'].evm.bytecode.object
    },
    SimYieldVault: {
      abi: output.contracts['SimYieldVault.sol']['SimYieldVault'].abi,
      bytecode: '0x' + output.contracts['SimYieldVault.sol']['SimYieldVault'].evm.bytecode.object
    },
    ERC4626Adapter: {
      abi: output.contracts['adapters/ERC4626Adapter.sol']['ERC4626Adapter'].abi,
      bytecode: '0x' + output.contracts['adapters/ERC4626Adapter.sol']['ERC4626Adapter'].evm.bytecode.object
    },
    MockUSDC: {
      abi: output.contracts['MockUSDC.sol']['MockUSDC'].abi,
      bytecode: '0x' + output.contracts['MockUSDC.sol']['MockUSDC'].evm.bytecode.object
    }
  };

  const outDir = path.resolve(__dirname, '../artifacts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'artifacts.json'), JSON.stringify(artifacts, null, 2), 'utf8');
  console.log('Compiled successfully. Artifacts saved to contracts/artifacts/artifacts.json');
  console.log('EuthynaVault bytecode size:', artifacts.EuthynaVault.bytecode.length / 2, 'bytes');
  console.log('MockUSDC bytecode size:', artifacts.MockUSDC.bytecode.length / 2, 'bytes');
}

compile();
